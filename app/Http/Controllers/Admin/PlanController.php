<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Plans', [
            'plans' => Plan::query()->withCount(['subscriptions as active_subscribers' => fn ($q) => $q->whereIn('status', Subscription::ENTITLED)])
                ->orderBy('sort')->orderBy('price_cents')->get(),
            'subscriptions' => Subscription::with(['user:id,name,email', 'plan:id,name'])->latest('id')->limit(100)->get()
                ->map(fn (Subscription $s) => [
                    'id' => $s->id, 'user' => $s->user?->only(['id', 'name', 'email']), 'plan' => $s->plan?->name,
                    'status' => $s->status, 'source' => $s->source, 'renews_at' => $s->current_period_end?->toIso8601String(),
                    'cancel_at_period_end' => $s->cancel_at_period_end,
                ]),
            'webhookUrl' => route('webhooks.stripe'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $plan = Plan::create($this->validated($request));
        $this->enforceSingleDefault($plan);
        AuditService::log('plan.created', $plan);

        return back()->with('success', 'Plan erstellt.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $plan->update($this->validated($request, $plan));
        $this->enforceSingleDefault($plan);
        AuditService::log('plan.updated', $plan);

        return back()->with('success', 'Plan gespeichert.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->subscriptions()->exists()) {
            return back()->withErrors(['plan' => 'Der Plan hat Abos und kann nicht gelöscht werden. Bitte stattdessen deaktivieren.']);
        }

        AuditService::log('plan.deleted', $plan);
        $plan->delete();

        return back()->with('success', 'Plan gelöscht.');
    }

    /**
     * Abo manuell vergeben (z. B. Geschenk, Firmenkunde, Rechnung).
     */
    public function assign(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'plan_id' => ['required', 'exists:plans,id'],
            'until' => ['nullable', 'date', 'after:now'],
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->subscriptions()->whereIn('status', Subscription::ENTITLED)->where('source', 'manual')->update(['status' => 'canceled', 'canceled_at' => now()]);

        $subscription = $user->subscriptions()->create([
            'plan_id' => $data['plan_id'], 'status' => 'active', 'source' => 'manual', 'current_period_end' => $data['until'] ?? null,
        ]);
        AuditService::log('subscription.assigned', $subscription, ['user' => $user->email]);

        return back()->with('success', 'Abo vergeben.');
    }

    public function revoke(Subscription $subscription): RedirectResponse
    {
        if ($subscription->source !== 'manual') {
            return back()->withErrors(['plan' => 'Stripe-Abos werden über Stripe bzw. das Kundenportal beendet.']);
        }

        $subscription->update(['status' => 'canceled', 'canceled_at' => now()]);
        AuditService::log('subscription.revoked', $subscription);

        return back()->with('success', 'Abo beendet.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Plan $plan = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'slug' => ['nullable', 'string', 'max:80', 'alpha_dash', Rule::unique('plans', 'slug')->ignore($plan?->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'price_cents' => ['required', 'integer', 'min:0', 'max:100000000'],
            'currency' => ['required', 'string', 'size:3'],
            'interval' => ['required', Rule::in(['month', 'year'])],
            'trial_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'limits' => ['nullable', 'array'],
            'limits.messages_per_day' => ['nullable', 'integer', 'min:-1'],
            'limits.tokens_per_month' => ['nullable', 'integer', 'min:-1'],
            'limits.uploads_per_day' => ['nullable', 'integer', 'min:-1'],
            'allowed_tiers' => ['nullable', 'array'],
            'allowed_tiers.*' => [Rule::in(['fast', 'balanced', 'strong'])],
            'highlights' => ['nullable', 'array', 'max:12'],
            'highlights.*' => ['nullable', 'string', 'max:120'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort' => ['nullable', 'integer', 'min:0', 'max:65000'],
        ]);

        $data['slug'] = ($data['slug'] ?? null) ?: Str::slug($data['name']).($plan ? '' : '-'.Str::lower(Str::random(4)));
        $data['currency'] = strtoupper($data['currency']);
        $data['trial_days'] = $data['trial_days'] ?? 0;
        $data['sort'] = $data['sort'] ?? 0;
        $data['limits'] = array_filter($data['limits'] ?? [], fn ($v) => $v !== null && $v !== '') ?: null;
        $data['allowed_tiers'] = ! empty($data['allowed_tiers']) ? array_values($data['allowed_tiers']) : null;
        $data['highlights'] = array_values(array_filter($data['highlights'] ?? [], fn ($v) => trim((string) $v) !== ''));

        if (($data['is_default'] ?? false) && $data['price_cents'] > 0) {
            $data['is_default'] = false;
        }

        return $data;
    }

    private function enforceSingleDefault(Plan $plan): void
    {
        if ($plan->is_default) {
            Plan::where('id', '!=', $plan->id)->update(['is_default' => false]);
        }
    }
}
