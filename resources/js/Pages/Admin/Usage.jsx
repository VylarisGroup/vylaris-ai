import { Head, Link } from '@inertiajs/react';
import { Badge, Card, Table, Td } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/api';

export default function Usage({ days, perUser, perFeature, recent }) {
    const n = (v) => Number(v || 0).toLocaleString('de-CH');

    return (
        <AdminLayout title="Nutzung & Kosten">
            <Head title="Nutzung" />
            <div className="flex gap-2">{[7, 30, 90].map((d) => <Link key={d} href={route('admin.usage', { days: d })} className={`rounded-lg px-3 py-1.5 text-sm ${d === days ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-gray-300 dark:bg-zinc-900 dark:ring-zinc-700'}`}>{d} Tage</Link>)}</div>
            <p className="text-xs text-gray-500">Kosten werden aus den hinterlegten Preisen pro 1 Mio. Tokens berechnet und sind Schätzungen (≈).</p>
            <Card title="Nach Funktion"><Table columns={['Funktion', 'Anfragen', 'Tokens', 'Kosten']}>{perFeature.map((f) => <tr key={f.feature}><Td>{f.feature}</Td><Td>{n(f.requests)}</Td><Td>{n(f.tokens)}</Td><Td>≈ {Number(f.cost || 0).toFixed(4)}</Td></tr>)}</Table></Card>
            <Card title="Nach Benutzer (Top 50)"><Table columns={['Benutzer', 'Anfragen', 'Tokens ein', 'Tokens aus', 'Kosten']}>{perUser.map((u, i) => <tr key={i}><Td><div>{u.user.name}</div><div className="text-xs text-gray-500">{u.user.email}</div></Td><Td>{n(u.requests)}</Td><Td>{n(u.tokens_in)}</Td><Td>{n(u.tokens_out)}</Td><Td>≈ {u.cost.toFixed(4)}</Td></tr>)}</Table></Card>
            <Card title="Letzte Anfragen"><Table columns={['Zeit', 'Funktion', 'Modell', 'Tokens', 'Latenz', 'Status']}>{recent.map((r) => <tr key={r.id}><Td className="whitespace-nowrap text-xs">{formatDate(r.created_at)}</Td><Td>{r.feature}</Td><Td>{r.model || '–'}</Td><Td>{n(r.tokens_in)} / {n(r.tokens_out)}</Td><Td>{r.latency_ms} ms</Td><Td><Badge color={r.status === 'ok' ? 'green' : r.status === 'fallback' ? 'amber' : 'red'}>{r.status}</Badge></Td></tr>)}</Table></Card>
        </AdminLayout>
    );
}
