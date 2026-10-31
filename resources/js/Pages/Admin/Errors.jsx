import { Head, Link, router } from '@inertiajs/react';
import { Button, Card, Table, Td } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/api';

export function Pager({ links, lastPage }) {
    if (!links || lastPage <= 1) return null;

    return <div className="flex flex-wrap justify-center gap-1">{links.map((l, i) => l.url ? <Link key={i} href={l.url} preserveScroll className={`rounded-lg px-3 py-1.5 text-sm ${l.active ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`} dangerouslySetInnerHTML={{ __html: l.label }} /> : <span key={i} className="px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: l.label }} />)}</div>;
}

export default function Errors({ errors }) {
    const prune = () => {
        const days = window.prompt('Nutzungs- und Fehlerlogs löschen, die älter sind als … Tage (Audit-Log bleibt erhalten):', '90');
        if (days) router.post(route('admin.logs.prune'), { days: Number(days) }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Fehlerprotokoll">
            <Head title="Fehlerprotokoll" />
            <div className="flex justify-end"><Button variant="secondary" size="sm" onClick={prune}>Alte Logs bereinigen</Button></div>
            <Card>
                {errors.data.length === 0 ? <p className="text-sm text-gray-500">Keine Fehler protokolliert.</p> : (
                    <Table columns={['Zeit', 'Provider / Modell', 'Funktion', 'HTTP', 'Meldung']}>
                        {errors.data.map((e) => (
                            <tr key={e.id}>
                                <Td className="whitespace-nowrap text-xs">{formatDate(e.created_at)}</Td>
                                <Td>{e.provider || '–'}<div className="text-xs text-gray-500">{e.model}</div></Td>
                                <Td>{e.feature || '–'}</Td><Td>{e.http_status || '–'}</Td>
                                <Td className="max-w-md break-words">{e.message}{e.context && <details className="mt-1"><summary className="cursor-pointer text-xs text-gray-500">Kontext</summary><pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2 text-xs dark:bg-zinc-800">{JSON.stringify(e.context, null, 2)}</pre></details>}</Td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            <Pager links={errors.links} lastPage={errors.last_page} />
        </AdminLayout>
    );
}
