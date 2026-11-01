import { Head, router, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, cx } from '@/Components/ui';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { api, errorMessage, formatDate } from '@/lib/api';

export const formatPrice = (cents, currency) => new Intl.NumberFormat('de-CH', { style: 'currency', currency, minimumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

const limitLabels = {
    messages_per_day: ['Nachrichten pro Tag', ''],
    tokens_per_month: ['Tokens pro Monat', ''],
    uploads_per_day: ['Uploads pro Tag', ''],
};

const tierLabels = { fast: 'Schnell', balanced: 'Ausgewogen', strong: 'Stark' };
const statusLabels = { active: 'Aktiv', trialing: 'Testphase', past_due: 'Zahlung überfällig', canceled: 'Beendet', incomplete: 'Unvollständig' };

function UsageBar({ label, used, limit }) {
    const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    return (
        <div>
            <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-zinc-400">
                <span>{label}</span>
                <span>{used.toLocaleString('de-CH')} / {limit === null ? 'unbegrenzt' : limit.toLocaleString('de-CH')}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700" role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className={cx('h-full rounded-full', percent >= 90 ? 'bg-red-500' : 'bg-brand-600')} style={{ width: `${limit === null ? 0 : percent}%` }} />
            </div>
        </div>
    );
}

function PlanCard({ plan, current, billingAvailable, hasStripeSubscription, onChoose, busy }) {
    const limits = Object.entries(limitLabels).filter(([k]) => plan.limits?.[k] !== undefined && plan.limits?.[k] !== null);

    return (
        <div className={cx('relative flex flex-col rounded-2xl border bg-white p-5 dark:bg-zinc-900', plan.is_featured ? 'border-brand-500 shadow-md' : 'border-gray-200 dark:border-zinc-700')}>
            {plan.is_featured && <Badge color="blue" className="absolute -top-2.5 left-5">Beliebt</Badge>}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 min-h-[2.5rem] text-sm text-gray-600 dark:text-zinc-400">{plan.description}</p>
            <p className="mt-3">
                <span className="text-3xl font-semibold">{plan.is_free ? 'Gratis' : formatPrice(plan.price_cents, plan.currency)}</span>
                {!plan.is_free && <span className="text-sm text-gray-500"> / {plan.interval === 'year' ? 'Jahr' : 'Monat'}</span>}
            </p>
            {plan.trial_days > 0 && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{plan.trial_days} Tage kostenlos testen</p>}

            <ul className="mt-4 flex-1 space-y-2 text-sm">
                {(plan.highlights || []).map((h) => <li key={h} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{h}</li>)}
                {limits.map(([k, [label]]) => (
                    <li key={k} className="flex gap-2 text-gray-600 dark:text-zinc-400"><Check className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />{plan.limits[k] < 0 ? `Unbegrenzt: ${label}` : `${Number(plan.limits[k]).toLocaleString('de-CH')} ${label}`}</li>
                ))}
                {plan.allowed_tiers?.length > 0 && <li className="flex gap-2 text-gray-600 dark:text-zinc-400"><Check className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />Modellstufen: {plan.allowed_tiers.map((t) => tierLabels[t] || t).join(', ')}</li>}
            </ul>

            <div className="mt-5">
                {current ? (
                    <Button variant="secondary" className="w-full" disabled metal={false}>Dein aktueller Plan</Button>
                ) : plan.is_free ? null : (
                    <Button className="w-full" onClick={() => onChoose(plan)} loading={busy === plan.id} disabled={!billingAvailable || hasStripeSubscription}>
                        {hasStripeSubscription ? 'Im Kundenportal ändern' : `${plan.name} wählen`}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function Billing({ plans, currentPlanId, subscription, billingAvailable, usage }) {
    const { errors } = usePage().props;
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState(null);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const checkout = params.get('checkout');

    const redirectTo = async (promise) => {
        try {
            const { url } = await promise;
            window.location.href = url;
        } catch (e) {
            setError(errorMessage(e, 'Aktion fehlgeschlagen.'));
            setBusy(null);
        }
    };

    const choose = (plan) => {
        setError(null);
        setBusy(plan.id);
        redirectTo(api.post(route('billing.checkout', plan.id)));
    };

    const portal = () => {
        setError(null);
        setBusy('portal');
        redirectTo(api.post(route('billing.portal')));
    };

    const stripeSub = subscription?.source === 'stripe';

    return (
        <SettingsLayout title="Abo & Nutzung">
            <Head title="Abo & Nutzung" />

            {checkout === 'success' && <Alert type="success">Vielen Dank! Dein Abo wird aktiviert, sobald Stripe die Zahlung bestätigt hat (meist wenige Sekunden). Lade die Seite danach neu.</Alert>}
            {checkout === 'cancel' && <Alert type="warning">Der Bezahlvorgang wurde abgebrochen. Es wurde nichts berechnet.</Alert>}
            {(error || errors?.billing) && <Alert type="error">{error || errors.billing}</Alert>}
            {!billingAvailable && <Alert type="info">Online-Bezahlung ist noch nicht eingerichtet. Bezahlte Pläne können vorerst nur vom Administrator vergeben werden.</Alert>}

            <Card title="Dein Abo" description="Aktueller Plan und Verbrauch.">
                {subscription ? (
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                        <Badge color={subscription.status === 'past_due' ? 'red' : 'green'}>{statusLabels[subscription.status] || subscription.status}</Badge>
                        {subscription.renews_at && <span className="text-gray-600 dark:text-zinc-400">{subscription.cancel_at_period_end ? 'Endet am' : 'Verlängert sich am'} {formatDate(subscription.renews_at)}</span>}
                        <div className="ml-auto flex gap-2">
                            {subscription.has_portal && <Button variant="secondary" size="sm" onClick={portal} loading={busy === 'portal'} metal={false}>Zahlung & Rechnungen</Button>}
                            <Button variant="secondary" size="sm" metal={false} onClick={() => router.patch(route('billing.cancel'), { cancel: !subscription.cancel_at_period_end }, { preserveScroll: true })}>
                                {subscription.cancel_at_period_end ? 'Abo fortsetzen' : 'Zum Laufzeitende kündigen'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="mb-4 text-sm text-gray-600 dark:text-zinc-400">Du nutzt den Gratis-Zugang.</p>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                    {Object.entries(limitLabels).map(([k, [label]]) => <UsageBar key={k} label={label} used={usage[k].used} limit={usage[k].limit} />)}
                </div>
            </Card>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} current={plan.id === currentPlanId} billingAvailable={billingAvailable} hasStripeSubscription={stripeSub} onChoose={choose} busy={busy} />
                ))}
            </div>
        </SettingsLayout>
    );
}
