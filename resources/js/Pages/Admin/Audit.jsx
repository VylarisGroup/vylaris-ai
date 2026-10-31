import { Head } from '@inertiajs/react';
import { Card, Table, Td } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/api';
import { Pager } from './Errors';

export default function Audit({ logs }) {
    return (
        <AdminLayout title="Audit-Log">
            <Head title="Audit-Log" />
            <Card description="Administrative Änderungen werden unveränderlich protokolliert; sie werden von der Log-Bereinigung nicht erfasst.">
                <Table columns={['Zeit', 'Benutzer', 'Aktion', 'Objekt', 'Details', 'IP']}>
                    {logs.data.map((l) => (
                        <tr key={l.id}>
                            <Td className="whitespace-nowrap text-xs">{formatDate(l.created_at)}</Td><Td>{l.user}</Td><Td><code className="text-xs">{l.action}</code></Td><Td>{l.subject || '–'}</Td>
                            <Td className="max-w-xs break-words text-xs text-gray-500">{l.meta ? JSON.stringify(l.meta) : ''}</Td><Td className="text-xs">{l.ip}</Td>
                        </tr>
                    ))}
                </Table>
            </Card>
            <Pager links={logs.links} lastPage={logs.last_page} />
        </AdminLayout>
    );
}
