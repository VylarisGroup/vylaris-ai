import { Head } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, Table, Td } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';

export default function System({ checks, info, failedJobs }) {
    return (
        <AdminLayout title="Systemstatus">
            <Head title="Systemstatus" />
            <Card title="Prüfungen">
                <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {checks.map((c) => <li key={c.name} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className="flex items-center gap-2">{c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}{c.name}</span><span className="text-right text-gray-500 dark:text-zinc-400">{c.detail}</span></li>)}
                </ul>
            </Card>
            <Card title="Umgebung"><dl className="grid gap-3 text-sm sm:grid-cols-4"><div><dt className="text-gray-500">Version</dt><dd>{info.version}</dd></div><div><dt className="text-gray-500">Laravel</dt><dd>{info.laravel}</dd></div><div><dt className="text-gray-500">Umgebung</dt><dd>{info.environment}</dd></div><div><dt className="text-gray-500">Dateispeicher</dt><dd>{info.storage_used_mb} MB</dd></div></dl></Card>
            <Card title="Fehlgeschlagene Jobs (letzte 10)">
                {failedJobs.length === 0 ? <p className="text-sm text-gray-500">Keine.</p> : <Table columns={['ID', 'Queue', 'Zeit', 'Fehler']}>{failedJobs.map((j) => <tr key={j.id}><Td>{j.id}</Td><Td>{j.queue}</Td><Td className="whitespace-nowrap text-xs">{j.failed_at}</Td><Td className="break-words text-xs">{j.exception}</Td></tr>)}</Table>}
            </Card>
        </AdminLayout>
    );
}
