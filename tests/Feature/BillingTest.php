<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Services\Ai\ModelRouter;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
    }

    private function enableStripe(): void
    {
        $settings = app(SettingsService::class);
        $settings->set('billing_enabled', true);
        $settings->set('stripe_secret_key', 'sk_test_123');
        $settings->set('stripe_webhook_secret', 'whsec_test');
    }

    private function signedWebhook(array $event, ?int $timestamp = null, string $secret = 'whsec_test'): TestResponse
    {
        $payload = json_encode($event);
        $timestamp ??= time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        return $this->call('POST', '/webhooks/stripe', [], [], [], [
            'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
    }

    public function test_plan_limits_take_precedence_over_role_limits_but_not_user_overrides(): void
    {
        $user = $this->makeUser();
        $this->assertSame(200, $user->limit('messages_per_day'));

        Plan::factory()->free()->create();
        $user = $user->fresh();
        $this->assertSame(5, $user->limit('messages_per_day'));
        $this->assertSame(1000000, $user->limit('tokens_per_month'), 'Ohne Plan-Wert gilt das Rollen-Limit.');

        $pro = Plan::factory()->create();
        Subscription::factory()->create(['user_id' => $user->id, 'plan_id' => $pro->id]);
        $this->assertSame(1000, $user->fresh()->limit('messages_per_day'));
        $this->assertNull($user->fresh()->limit('tokens_per_month'), '-1 bedeutet unbegrenzt.');

        $user->update(['limit_overrides' => ['messages_per_day' => 7]]);
        $this->assertSame(7, $user->fresh()->limit('messages_per_day'));
    }

    public function test_expired_or_canceled_subscriptions_fall_back_to_the_default_plan(): void
    {
        Plan::factory()->free()->create();
        $user = $this->makeUser();

        Subscription::factory()->create(['user_id' => $user->id, 'current_period_end' => now()->subDay()]);
        Subscription::factory()->create(['user_id' => $user->id, 'status' => 'canceled']);

        $this->assertSame(5, $user->fresh()->limit('messages_per_day'));
    }

    public function test_plans_can_restrict_model_tiers(): void
    {
        $this->makeChatModel(attributes: ['tier' => 'fast']);
        $this->makeChatModel(attributes: ['tier' => 'strong']);
        Plan::factory()->free()->create(['allowed_tiers' => ['fast']]);

        $router = app(ModelRouter::class);

        $this->assertCount(2, $router->chatModels());
        $this->assertSame(['fast'], $router->chatModels($this->makeUser())->pluck('tier')->all());
    }

    public function test_billing_page_lists_active_plans(): void
    {
        Plan::factory()->free()->create(['name' => 'Gratis']);
        Plan::factory()->create(['name' => 'Pro']);
        Plan::factory()->create(['name' => 'Versteckt', 'is_active' => false]);

        $this->actingAs($this->makeUser())->get(route('billing.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Settings/Billing')->has('plans', 2)->where('billingAvailable', false));
    }

    public function test_checkout_creates_a_stripe_session_with_inline_price(): void
    {
        $this->enableStripe();
        Http::fake(['api.stripe.com/v1/checkout/sessions' => Http::response(['url' => 'https://checkout.stripe.com/c/pay_1'])]);
        $plan = Plan::factory()->create(['price_cents' => 1900, 'currency' => 'CHF', 'trial_days' => 7]);

        $this->actingAs($this->makeUser())->postJson(route('billing.checkout', $plan))
            ->assertOk()->assertJson(['url' => 'https://checkout.stripe.com/c/pay_1']);

        Http::assertSent(fn ($request) => $request['mode'] === 'subscription'
            && $request['line_items'][0]['price_data']['unit_amount'] === 1900
            && $request['line_items'][0]['price_data']['currency'] === 'chf'
            && $request['subscription_data']['trial_period_days'] === 7
            && $request->hasHeader('Authorization', 'Bearer sk_test_123'));
    }

    public function test_checkout_is_refused_without_configuration_and_for_free_plans(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)->postJson(route('billing.checkout', Plan::factory()->create()))->assertStatus(422);

        $this->enableStripe();
        $this->actingAs($user)->postJson(route('billing.checkout', Plan::factory()->free()->create()))->assertNotFound();
    }

    public function test_webhook_rejects_invalid_signatures_and_stale_timestamps(): void
    {
        $this->enableStripe();
        $event = ['type' => 'checkout.session.completed', 'data' => ['object' => []]];

        $this->signedWebhook($event, secret: 'falsch')->assertStatus(400);
        $this->signedWebhook($event, time() - 3600)->assertStatus(400);
        $this->postJson('/webhooks/stripe', $event)->assertStatus(400);
    }

    public function test_webhook_activates_updates_and_ends_subscriptions(): void
    {
        $this->enableStripe();
        $user = $this->makeUser();
        $plan = Plan::factory()->create();
        $end = now()->addMonth()->timestamp;

        $this->signedWebhook(['type' => 'checkout.session.completed', 'data' => ['object' => [
            'client_reference_id' => (string) $user->id, 'customer' => 'cus_1', 'subscription' => 'sub_1', 'metadata' => ['plan_id' => (string) $plan->id],
        ]]])->assertOk();

        $subscription = Subscription::where('stripe_subscription_id', 'sub_1')->firstOrFail();
        $this->assertSame('cus_1', $user->fresh()->stripe_customer_id);
        $this->assertSame($plan->id, $user->fresh()->currentPlan()->id);

        $this->signedWebhook(['type' => 'customer.subscription.updated', 'data' => ['object' => [
            'id' => 'sub_1', 'status' => 'active', 'customer' => 'cus_1', 'cancel_at_period_end' => true, 'current_period_end' => $end,
        ]]])->assertOk();
        $this->assertTrue($subscription->fresh()->cancel_at_period_end);
        $this->assertSame($end, $subscription->fresh()->current_period_end->timestamp);

        $this->signedWebhook(['type' => 'customer.subscription.deleted', 'data' => ['object' => ['id' => 'sub_1', 'status' => 'canceled']]])->assertOk();
        $this->assertSame('canceled', $subscription->fresh()->status);
        $this->assertNull($user->fresh()->activeSubscription());
    }

    public function test_users_can_cancel_and_resume_a_manual_subscription(): void
    {
        $user = $this->makeUser();
        $subscription = Subscription::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->patch(route('billing.cancel'), ['cancel' => true])->assertRedirect();
        $this->assertTrue($subscription->fresh()->cancel_at_period_end);

        $this->actingAs($user)->patch(route('billing.cancel'), ['cancel' => false]);
        $this->assertFalse($subscription->fresh()->cancel_at_period_end);
    }

    public function test_only_admins_manage_plans_and_default_plan_stays_unique(): void
    {
        $payload = ['name' => 'Gratis', 'price_cents' => 0, 'currency' => 'chf', 'interval' => 'month', 'is_default' => true, 'limits' => ['messages_per_day' => '10', 'tokens_per_month' => ''], 'highlights' => ['A', ' ']];

        $this->actingAs($this->makeUser())->post(route('admin.plans.store'), $payload)->assertForbidden();

        $admin = $this->makeUser('admin');
        $old = Plan::factory()->free()->create();

        $this->actingAs($admin)->post(route('admin.plans.store'), $payload)->assertRedirect();

        $plan = Plan::where('name', 'Gratis')->latest('id')->firstOrFail();
        $this->assertSame('CHF', $plan->currency);
        $this->assertSame(['messages_per_day' => '10'], $plan->limits);
        $this->assertSame(['A'], $plan->highlights);
        $this->assertTrue($plan->is_default);
        $this->assertFalse($old->fresh()->is_default);
    }

    public function test_admin_can_assign_and_revoke_manual_subscriptions_and_plans_with_subscribers_cannot_be_deleted(): void
    {
        $admin = $this->makeUser('admin');
        $user = $this->makeUser();
        $plan = Plan::factory()->create();

        $this->actingAs($admin)->post(route('admin.subscriptions.assign'), ['email' => $user->email, 'plan_id' => $plan->id])->assertRedirect();
        $subscription = $user->activeSubscription();
        $this->assertSame($plan->id, $subscription->plan_id);

        $this->actingAs($admin)->delete(route('admin.plans.destroy', $plan))->assertSessionHasErrors('plan');
        $this->assertModelExists($plan);

        $this->actingAs($admin)->delete(route('admin.subscriptions.revoke', $subscription))->assertRedirect();
        $this->assertNull($user->fresh()->activeSubscription());

        $this->actingAs($admin)->get(route('admin.plans.index'))->assertOk()->assertInertia(fn ($page) => $page->component('Admin/Plans'));
    }
}
