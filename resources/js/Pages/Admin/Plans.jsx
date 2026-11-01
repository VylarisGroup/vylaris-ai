import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, Modal, Select, Table, Td, Textarea, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatPrice } from '@/Pages/Settings/Billing';
import { formatDate } from '@/lib/api';

const TIERS = [['fast', 'Schnell'], ['balanced', 'Ausgewogen'], ['strong', 'Stark']];

function PlanForm({ plan, onClose }) {
    const limits = plan?.limits || {};
    const form = useForm({
        name: plan?.name || '', slug: plan?.slug || '', description: plan?.description || '',
        price: plan ? (plan.price_cents / 100).toString() : '0', currency: plan?.currency || 'CHF', interval: plan?.interval || 'month', trial_days: plan?.trial_days ?? 0,
        limits: { messages_per_day: limits.messages_per_day ?? '', tokens_per_month: limits.tokens_per_month ?? '', uploads_per_day: limits.uploads_per_day ?? '' },
        allowed_tiers: plan?.allowed_tiers || [], highlights_text: (plan?.highlights || []).join('\n'),
        is_active: plan?.is_active ?? true, is_default: plan?.is_default ?? false, is_featured: plan?.is_featured ?? false, sort: plan?.sort ?? 0,
    });
    const setLimit = (k, v) => form.setData('limits', { ...form.data.limits, [k]: v });

    const submit = (e) => {
        e.preventDefault();
        form.transform(({ price, highlights_text, ...d }) => ({ ...d, price_cents: Math.round(parseFloat(String(price).replace(',', '.') || '0') * 100), highlights: highlights_text.split('\n') }));
        const opts = { preserveScroll: true, onSuccess: onClose };
        plan ? form.patch(route('admin.plans.update', plan.id), opts) : form.post(route('admin.plans.store'), opts);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
                <Field label="Kennung (optional)" error={form.errors.slug}><Input value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} /></Field>
            </div>
            <Field label="Kurzbeschreibung" error={form.errors.description}><Input value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Preis" error={form.errors.price_cents}><Input inputMode="decimal" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} /></Field>
                <Field label="Währung" error={form.errors.currency}><Input maxLength={3} value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value.toUpperCase())} /></Field>
                <Field label="Intervall"><Select value={form.data.interval} onChange={(e) => form.setData('interval', e.target.value)}><option value="month">Monatlich</option><option value="year">Jährlich</option></Select></Field>
                <Field label="Testtage" error={form.errors.trial_days}><Input type="number" min="0" value={form.data.trial_days} onChange={(e) => form.setData('trial_days', e.target.value)} /></Field>
            </div>
            <div>
                <p className="mb-1 text-sm font-medium">Limits</p>
                <p className="mb-2 text-xs text-gray-500">Leer = Limit der Benutzerrolle, -1 = unbegrenzt. Persönliche Overrides pro Benutzer haben Vorrang.</p>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Nachrichten/Tag"><Input type="number" min="-1" value={form.data.limits.messages_per_day} onChange={(e) => setLimit('messages_per_day', e.target.value)} /></Field>
                    <Field label="Tokens/Monat"><Input type="number" min="-1" value={form.data.limits.tokens_per_month} onChange={(e) => setLimit('tokens_per_month', e.target.value)} /></Field>
                    <Field label="Uploads/Tag"><Input type="number" min="-1" value={form.data.limits.uploads_per_day} onChange={(e) => setLimit('uploads_per_day', e.target.value)} /></Field>
                </div>
            </div>
            <div>
                <p className="mb-1 text-sm font-medium">Erlaubte Modellstufen</p>
                <p className="mb-2 text-xs text-gray-500">Keine Auswahl = alle Stufen.</p>
                <div className="flex flex-wrap gap-3">{TIERS.map(([k, l]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-gray-300 text-brand-600" checked={form.data.allowed_tiers.includes(k)} onChange={() => form.setData('allowed_tiers', form.data.allowed_tiers.includes(k) ? form.data.allowed_tiers.filter((x) => x !== k) : [...form.data.allowed_tiers, k])} />{l}</label>)}</div>
            </div>
            <Field label="Vorteile (eine Zeile pro Punkt)" error={form.errors.highlights}><Textarea rows={4} value={form.data.highlights_text} onChange={(e) => form.setData('highlights_text', e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
                <Toggle checked={form.data.is_active} onChange={(v) => form.setData('is_active', v)} label="Aktiv (auf der Preisseite sichtbar)" />
                <Toggle checked={form.data.is_featured} onChange={(v) => form.setData('is_featured', v)} label="Als «Beliebt» hervorheben" />
                <Toggle checked={form.data.is_default} onChange={(v) => form.setData('is_default', v)} label="Standardplan ohne Abo (nur kostenlos)" />
                <Field label="Sortierung"><Input type="number" min="0" value={form.data.sort} onChange={(e) => form.setData('sort', e.target.value)} /></Field>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose} metal={false}>Abbrechen</Button><Button type="submit" loading={form.processing}>Speichern</Button></div>
        </form>
    );
}

function AssignForm({ plans }) {
    const form = useForm({ email: '', plan_id: plans[0]?.id ?? '', until: '' });

    return (
        <form onSubmit={(e) => { e.preventDefault(); form.post(route('admin.subscriptions.assign'), { preserveScroll: true, onSuccess: () => form.reset('email', 'until') }); }} className="grid gap-3 sm:grid-cols-4 sm:items-end">
            <Field label="E-Mail des Benutzers" error={form.errors.email}><Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
            <Field label="Plan" error={form.errors.plan_id}><Select value={form.data.plan_id} onChange={(e) => form.setData('plan_id', e.target.value)}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            <Field label="Gültig bis (optional)" error={form.errors.until}><Input type="date" value={form.data.until} onChange={(e) => form.setData('until', e.target.value)} /></Field>
            <Button type="submit" loading={form.processing}>Vergeben</Button>
        </form>
    );
}

export default function Plans({ plans, subscriptions, webhookUrl }) {
    const [editing, setEditing] = useState(undefined);

    return (
        <AdminLayout title="Abos & Pläne">
            <Head title="Abos & Pläne" />
            <div className="flex items-center justify-between gap-4">
                <p className="max-w-2xl text-sm text-gray-600 dark:text-zinc-400">Pläne bestimmen Preis, Limits und verfügbare Modellstufen. Die Bezahlung läuft über Stripe (Schlüssel unter «Plattform» → Abos). Webhook-URL in Stripe eintragen: <code className="rounded bg-gray-100 px-1 dark:bg-zinc-800">{webhookUrl}</code> (Events: checkout.session.completed, customer.subscription.*).</p>
                <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Neuer Plan</Button>
            </div>

            {plans.length === 0 ? <EmptyState title="Noch keine Pläne" /> : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((p) => (
                        <Card key={p.id} title={p.name} description={p.price_cents === 0 ? 'Gratis' : `${formatPrice(p.price_cents, p.currency)} / ${p.interval === 'year' ? 'Jahr' : 'Monat'}`}
                            actions={<><IconButton label="Bearbeiten" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></IconButton><IconButton label="Löschen" onClick={() => window.confirm(`Plan „${p.name}“ löschen?`) && router.delete(route('admin.plans.destroy', p.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton></>}>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge color={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Aktiv' : 'Inaktiv'}</Badge>
                                {p.is_default && <Badge color="blue">Standard</Badge>}
                                {p.is_featured && <Badge color="blue">Beliebt</Badge>}
                                <Badge>{p.active_subscribers} Abonnenten</Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Card title="Abo manuell vergeben" description="Für Geschenke, Firmenkunden oder Zahlung per Rechnung. Ein bestehendes manuelles Abo wird ersetzt.">
                {plans.length > 0 && <AssignForm plans={plans} />}
            </Card>

            <Card title="Letzte Abonnements">
                {subscriptions.length === 0 ? <EmptyState title="Noch keine Abonnements" /> : (
                    <Table columns={['Benutzer', 'Plan', 'Status', 'Quelle', 'Läuft bis', '']}>
                        {subscriptions.map((s) => (
                            <tr key={s.id}>
                                <Td>{s.user?.email}</Td><Td>{s.plan}</Td>
                                <Td><Badge color={s.status === 'active' || s.status === 'trialing' ? 'green' : s.status === 'past_due' ? 'red' : 'gray'}>{s.status}</Badge>{s.cancel_at_period_end && <span className="ml-1 text-xs text-gray-500">(gekündigt)</span>}</Td>
                                <Td>{s.source === 'stripe' ? 'Stripe' : 'Manuell'}</Td>
                                <Td>{s.renews_at ? formatDate(s.renews_at) : '–'}</Td>
                                <Td>{s.source === 'manual' && ['active', 'trialing'].includes(s.status) && <Button size="sm" variant="secondary" metal={false} onClick={() => window.confirm('Abo beenden?') && router.delete(route('admin.subscriptions.revoke', s.id), { preserveScroll: true })}>Beenden</Button>}</Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>

            <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Plan bearbeiten' : 'Neuer Plan'} wide>
                {editing !== undefined && <PlanForm key={editing?.id ?? 'new'} plan={editing} onClose={() => setEditing(undefined)} />}
            </Modal>
        </AdminLayout>
    );
}
