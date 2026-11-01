<?php

namespace App\Services\Billing;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Http;

/**
 * Schlanke Stripe-Anbindung über die REST-API (Checkout, Kundenportal, Webhooks) ohne zusätzliche Abhängigkeit.
 */
class StripeService
{
    private const API = 'https://api.stripe.com/v1';

    public function __construct(private SettingsService $settings) {}

    public function isConfigured(): bool
    {
        return (bool) $this->settings->get('billing_enabled', false) && (string) $this->settings->get('stripe_secret_key', '') !== '';
    }

    /**
     * Checkout-Session für ein Plan-Abo; der Preis wird direkt aus dem Plan übergeben (kein Stripe-Produkt nötig).
     */
    public function checkoutUrl(User $user, Plan $plan, string $successUrl, string $cancelUrl): string
    {
        $params = [
            'mode' => 'subscription',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'client_reference_id' => (string) $user->id,
            'allow_promotion_codes' => 'true',
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => strtolower($plan->currency),
                    'unit_amount' => $plan->price_cents,
                    'recurring' => ['interval' => $plan->interval === 'year' ? 'year' : 'month'],
                    'product_data' => ['name' => $plan->name, 'description' => $plan->description ?: null],
                ],
            ]],
            'metadata' => ['plan_id' => (string) $plan->id, 'user_id' => (string) $user->id],
            'subscription_data' => ['metadata' => ['plan_id' => (string) $plan->id, 'user_id' => (string) $user->id]],
        ];

        if ($plan->trial_days > 0) {
            $params['subscription_data']['trial_period_days'] = $plan->trial_days;
        }

        if ($user->stripe_customer_id) {
            $params['customer'] = $user->stripe_customer_id;
        } else {
            $params['customer_email'] = $user->email;
        }

        return (string) $this->post('/checkout/sessions', $params)['url'];
    }

    public function portalUrl(User $user, string $returnUrl): string
    {
        return (string) $this->post('/billing_portal/sessions', [
            'customer' => $user->stripe_customer_id,
            'return_url' => $returnUrl,
        ])['url'];
    }

    public function cancelAtPeriodEnd(Subscription $subscription, bool $cancel): void
    {
        if ($subscription->stripe_subscription_id) {
            $this->post('/subscriptions/'.$subscription->stripe_subscription_id, ['cancel_at_period_end' => $cancel ? 'true' : 'false']);
        }

        $subscription->update(['cancel_at_period_end' => $cancel]);
    }

    /**
     * Prüft die Stripe-Signatur (HMAC-SHA256, 5 Minuten Toleranz) und liefert das Event.
     *
     * @return array<string, mixed>|null
     */
    public function verifyWebhook(string $payload, ?string $header): ?array
    {
        $secret = (string) $this->settings->get('stripe_webhook_secret', '');

        if ($secret === '' || ! $header) {
            return null;
        }

        $timestamp = null;
        $signatures = [];

        foreach (explode(',', $header) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');

            if ($key === 't') {
                $timestamp = (int) $value;
            } elseif ($key === 'v1') {
                $signatures[] = $value;
            }
        }

        if (! $timestamp || abs(time() - $timestamp) > 300) {
            return null;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        foreach ($signatures as $signature) {
            if (hash_equals($expected, $signature)) {
                $event = json_decode($payload, true);

                return is_array($event) ? $event : null;
            }
        }

        return null;
    }

    /**
     * Wendet ein Stripe-Event auf die lokalen Abos an.
     *
     * @param  array<string, mixed>  $event
     */
    public function handleEvent(array $event): void
    {
        $object = $event['data']['object'] ?? [];

        match ($event['type'] ?? '') {
            'checkout.session.completed' => $this->onCheckoutCompleted($object),
            'customer.subscription.created', 'customer.subscription.updated' => $this->syncSubscription($object),
            'customer.subscription.deleted' => $this->syncSubscription($object, 'canceled'),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $session
     */
    private function onCheckoutCompleted(array $session): void
    {
        $user = User::find((int) ($session['client_reference_id'] ?? $session['metadata']['user_id'] ?? 0));

        if (! $user) {
            return;
        }

        if (! empty($session['customer']) && $user->stripe_customer_id !== $session['customer']) {
            $user->forceFill(['stripe_customer_id' => $session['customer']])->save();
        }

        if (! empty($session['subscription']) && ($plan = Plan::find((int) ($session['metadata']['plan_id'] ?? 0)))) {
            Subscription::updateOrCreate(
                ['stripe_subscription_id' => $session['subscription']],
                ['user_id' => $user->id, 'plan_id' => $plan->id, 'source' => 'stripe', 'stripe_customer_id' => $session['customer'] ?? null, 'status' => 'active'],
            );
        }
    }

    /**
     * @param  array<string, mixed>  $object
     */
    private function syncSubscription(array $object, ?string $forceStatus = null): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $object['id'] ?? '')->first();

        if (! $subscription) {
            $user = User::find((int) ($object['metadata']['user_id'] ?? 0));
            $plan = Plan::find((int) ($object['metadata']['plan_id'] ?? 0));

            if (! $user || ! $plan) {
                return;
            }

            $subscription = new Subscription(['user_id' => $user->id, 'plan_id' => $plan->id, 'source' => 'stripe', 'stripe_subscription_id' => $object['id']]);
        }

        $status = $forceStatus ?? match ($object['status'] ?? 'active') {
            'active' => 'active',
            'trialing' => 'trialing',
            'past_due', 'unpaid' => 'past_due',
            'canceled', 'incomplete_expired' => 'canceled',
            default => 'incomplete',
        };

        $periodEnd = $object['current_period_end'] ?? $object['items']['data'][0]['current_period_end'] ?? null;

        $subscription->fill([
            'status' => $status,
            'stripe_customer_id' => $object['customer'] ?? $subscription->stripe_customer_id,
            'cancel_at_period_end' => (bool) ($object['cancel_at_period_end'] ?? false),
            'current_period_end' => $periodEnd ? now()->setTimestamp((int) $periodEnd) : $subscription->current_period_end,
            'canceled_at' => $status === 'canceled' ? ($subscription->canceled_at ?? now()) : null,
        ])->save();
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    private function post(string $path, array $params): array
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Bezahlung ist nicht eingerichtet.');
        }

        $response = Http::withToken((string) $this->settings->get('stripe_secret_key'))
            ->asForm()
            ->timeout(20)
            ->post(self::API.$path, $params);

        if ($response->failed()) {
            throw new \RuntimeException('Stripe: '.($response->json('error.message') ?? 'Anfrage fehlgeschlagen.'));
        }

        return $response->json();
    }
}
