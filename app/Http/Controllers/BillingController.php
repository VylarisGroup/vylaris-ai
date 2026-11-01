<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Plan;
use App\Models\UsageLog;
use App\Models\UserFile;
use App\Services\Billing\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(private StripeService $stripe) {}

    /**
     * Preise und Abo-Verwaltung des Benutzers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->activeSubscription();
        $current = $subscription?->plan ?? $user->currentPlan();

        return Inertia::render('Settings/Billing', [
            'plans' => Plan::query()->where('is_active', true)->orderBy('sort')->orderBy('price_cents')->get()
                ->map(fn (Plan $p) => $this->serializePlan($p))->values(),
            'currentPlanId' => $current?->id,
            'subscription' => $subscription ? [
                'status' => $subscription->status,
                'source' => $subscription->source,
                'renews_at' => $subscription->current_period_end?->toIso8601String(),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'has_portal' => $subscription->source === 'stripe' && $user->stripe_customer_id !== null,
            ] : null,
            'billingAvailable' => $this->stripe->isConfigured(),
            'usage' => $this->usage($request),
        ]);
    }

    public function checkout(Request $request, Plan $plan): JsonResponse
    {
        abort_unless($plan->is_active && ! $plan->isFree(), 404);

        if (! $this->stripe->isConfigured()) {
            return response()->json(['message' => 'Bezahlung ist noch nicht eingerichtet.'], 422);
        }

        if ($request->user()->activeSubscription()?->source === 'stripe') {
            return response()->json(['message' => 'Es besteht bereits ein Abo. Bitte im Kundenportal ändern.'], 422);
        }

        try {
            $url = $this->stripe->checkoutUrl(
                $request->user(),
                $plan,
                route('billing.index', ['checkout' => 'success']),
                route('billing.index', ['checkout' => 'cancel']),
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['url' => $url]);
    }

    public function portal(Request $request): JsonResponse
    {
        abort_unless($request->user()->stripe_customer_id, 404);

        try {
            return response()->json(['url' => $this->stripe->portalUrl($request->user(), route('billing.index'))]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Kündigung zum Laufzeitende bzw. Reaktivierung.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $data = $request->validate(['cancel' => ['required', 'boolean']]);
        $subscription = $request->user()->activeSubscription();
        abort_unless($subscription, 404);

        try {
            $subscription->source === 'stripe'
                ? $this->stripe->cancelAtPeriodEnd($subscription, (bool) $data['cancel'])
                : $subscription->update(['cancel_at_period_end' => (bool) $data['cancel']]);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['billing' => $e->getMessage()]);
        }

        return back()->with('success', $data['cancel'] ? 'Das Abo endet zum Laufzeitende.' : 'Das Abo wurde fortgesetzt.');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializePlan(Plan $p): array
    {
        return [
            'id' => $p->id, 'name' => $p->name, 'description' => $p->description,
            'price_cents' => $p->price_cents, 'currency' => $p->currency, 'interval' => $p->interval,
            'trial_days' => $p->trial_days, 'limits' => $p->limits ?? [], 'highlights' => $p->highlights ?? [],
            'allowed_tiers' => $p->allowed_tiers, 'is_featured' => $p->is_featured, 'is_free' => $p->isFree(),
        ];
    }

    /**
     * @return array<string, array{used: int, limit: ?int}>
     */
    private function usage(Request $request): array
    {
        $user = $request->user();

        return [
            'messages_per_day' => [
                'used' => Message::where('role', 'user')->whereHas('chat', fn ($q) => $q->where('user_id', $user->id))->where('created_at', '>=', now()->startOfDay())->count(),
                'limit' => $user->limit('messages_per_day'),
            ],
            'tokens_per_month' => [
                'used' => (int) UsageLog::where('user_id', $user->id)->where('created_at', '>=', now()->startOfMonth())->selectRaw('COALESCE(SUM(tokens_in + tokens_out), 0) as total')->value('total'),
                'limit' => $user->limit('tokens_per_month'),
            ],
            'uploads_per_day' => [
                'used' => UserFile::where('user_id', $user->id)->where('kind', '!=', 'generated')->where('created_at', '>=', now()->startOfDay())->count(),
                'limit' => $user->limit('uploads_per_day'),
            ],
        ];
    }
}
