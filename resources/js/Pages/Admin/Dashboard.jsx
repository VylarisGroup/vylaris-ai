import { Head, Link } from '@inertiajs/react';
import { Badge, Card, Table, Td } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';

function Stat({ label, value }) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><dt className="text-xs text-gray-500 dark:text-zinc-400">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd></div>;
}

function Bars({ series, field, label }) {
    const max = Math.max(1, ...series.map((s) => s[field]));

    return (
        <figure>
            <figcaption className="mb-2 text-sm font-medium">{label}</figcaption>
            <div className="flex h-28 items-end gap-0.5" role="img" aria-label={`${label}: Verlauf der letzten 30 Tage`}>
                {series.map((s) => <div key={s.day} title={`${s.day}: ${s[field]}`} className="min-w-0 flex-1 rounded-t bg-brand-500/80" style={{ height: `${Math.max(2, (s[field] / max) * 100)}%` }} />)}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-400"><span>{series[0]?.day}</span><span>{series[series.length - 1]?.day}</span></div>
        </figure>
    );
}

export default function Dashboard({ totals, series, topModels, features, providers }) {
    const n = (v) => Number(v).toLocaleString('de-CH');

    return (
        <AdminLayout title="Übersicht">
            <Head title="Admin" />
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Benutzer" value={n(totals.users)} /><Stat label="Aktiv (7 Tage)" value={n(totals.active_users_7d)} />
                <Stat label="Chats" value={n(totals.chats)} /><Stat label="Nachrichten" value={n(totals.messages)} />
                <Stat label="Tokens (30 Tage)" value={n(totals.tokens_30d)} /><Stat label="Kosten (30 Tage)" value={`≈ ${totals.cost_30d.toFixed(2)}`} />
                <Stat label="Fehler (24 h)" value={n(totals.errors_24h)} />
            </dl>
            <Card title="Verlauf (30 Tage)"><div className="grid gap-6 md:grid-cols-3"><Bars series={series} field="requests" label="Anfragen" /><Bars series={series} field="tokens" label="Tokens" /><Bars series={series} field="cost" label="Kosten" /></div></Card>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Funktionsstatus" description="Nicht konfigurierte Funktionen sind für Benutzer klar als nicht verfügbar markiert.">
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">{features.map((f) => <li key={f.key} className="flex items-center justify-between gap-3 py-2 text-sm"><span>{f.name}</span><span className="flex items-center gap-2">{f.reason && <span className="hidden text-xs text-gray-500 sm:inline">{f.reason}</span>}<Badge color={f.enabled && f.configured ? 'green' : f.enabled ? 'amber' : 'gray'}>{f.enabled && f.configured ? 'OK' : f.enabled ? 'Offen' : 'Aus'}</Badge></span></li>)}</ul>
                    <p className="mt-3 text-right text-sm"><Link href={route('admin.features.index')} className="text-brand-600 hover:underline">Funktionen verwalten →</Link></p>
                </Card>
                <Card title="Provider">
                    {providers.length === 0 ? <p className="text-sm text-gray-500">Noch kein Provider. <Link href={route('admin.providers.index')} className="text-brand-600 underline">Jetzt einrichten</Link></p> : (
                        <ul className="divide-y divide-gray-100 dark:divide-zinc-800">{providers.map((p) => <li key={p.id} className="flex items-center justify-between py-2 text-sm"><span>{p.name} <span className="text-xs text-gray-500">({p.models_count} Modelle)</span></span><span className="flex gap-1"><Badge color={p.is_enabled ? 'green' : 'gray'}>{p.is_enabled ? 'Aktiv' : 'Inaktiv'}</Badge>{p.is_fallback && <Badge color="amber">Fallback</Badge>}</span></li>)}</ul>
                    )}
                </Card>
            </div>
            <Card title="Meistgenutzte Modelle (30 Tage)">
                {topModels.length === 0 ? <p className="text-sm text-gray-500">Noch keine Nutzung.</p> : <Table columns={['Modell', 'Anfragen', 'Tokens', 'Kosten']}>{topModels.map((m) => <tr key={m.name}><Td>{m.name}</Td><Td>{n(m.requests)}</Td><Td>{n(m.tokens)}</Td><Td>≈ {m.cost.toFixed(4)}</Td></tr>)}</Table>}
            </Card>
        </AdminLayout>
    );
}
