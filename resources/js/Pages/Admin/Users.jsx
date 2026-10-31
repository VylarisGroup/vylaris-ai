import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Field, IconButton, Input, Modal, Select, Table, Td, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/api';

function UserForm({ user, roles, onClose }) {
    const lo = user?.limit_overrides || {};
    const form = useForm({
        name: user?.name || '', email: user?.email || '', password: '', role_id: user?.role_id || roles.find((r) => r.slug === 'user')?.id || roles[0]?.id, is_active: user?.is_active ?? true,
        limit_overrides: { messages_per_day: lo.messages_per_day ?? '', tokens_per_month: lo.tokens_per_month ?? '', uploads_per_day: lo.uploads_per_day ?? '' },
    });
    const setLimit = (k, v) => form.setData('limit_overrides', { ...form.data.limit_overrides, [k]: v });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        form.transform((d) => (user ? { ...d, password: d.password || undefined, email: undefined } : { name: d.name, email: d.email, password: d.password, role_id: d.role_id }));
        user ? form.patch(route('admin.users.update', user.id), opts) : form.post(route('admin.users.store'), opts);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
            <Field label="E-Mail" error={form.errors.email}><Input type="email" value={form.data.email} disabled={!!user} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
            <Field label={user ? 'Neues Passwort (optional)' : 'Passwort'} error={form.errors.password}><Input type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required={!user} /></Field>
            <Field label="Rolle" error={form.errors.role_id}><Select value={form.data.role_id} onChange={(e) => form.setData('role_id', Number(e.target.value))}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></Field>
            {user && (
                <>
                    <Toggle checked={form.data.is_active} onChange={(v) => form.setData('is_active', v)} label="Konto aktiv" description="Deaktivierte Benutzer werden sofort abgemeldet." />
                    <div>
                        <p className="mb-1 text-sm font-medium">Individuelle Limits (überschreiben die Rolle; leer = Rollenwert)</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Field label="Nachrichten/Tag"><Input type="number" min="0" value={form.data.limit_overrides.messages_per_day} onChange={(e) => setLimit('messages_per_day', e.target.value)} /></Field>
                            <Field label="Tokens/Monat"><Input type="number" min="0" value={form.data.limit_overrides.tokens_per_month} onChange={(e) => setLimit('tokens_per_month', e.target.value)} /></Field>
                            <Field label="Uploads/Tag"><Input type="number" min="0" value={form.data.limit_overrides.uploads_per_day} onChange={(e) => setLimit('uploads_per_day', e.target.value)} /></Field>
                        </div>
                    </div>
                </>
            )}
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button><Button type="submit" loading={form.processing}>Speichern</Button></div>
        </form>
    );
}

export default function Users({ users, roles, filters }) {
    const [editing, setEditing] = useState(undefined);
    const [q, setQ] = useState(filters.q || '');

    return (
        <AdminLayout title="Benutzer">
            <Head title="Benutzer" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <form onSubmit={(e) => { e.preventDefault(); router.get(route('admin.users.index'), { q }, { preserveState: true }); }} className="relative w-full max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name oder E-Mail suchen…" aria-label="Benutzer suchen" className="!pl-9" />
                </form>
                <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Benutzer anlegen</Button>
            </div>
            <Table columns={['Name', 'Rolle', 'Status', 'Chats', 'Zuletzt aktiv', '']}>
                {users.data.map((u) => (
                    <tr key={u.id}>
                        <Td><div className="font-medium">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></Td>
                        <Td><Badge color="blue">{u.role}</Badge></Td>
                        <Td><div className="flex flex-wrap gap-1"><Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Aktiv' : 'Gesperrt'}</Badge>{!u.verified && <Badge color="amber">E-Mail offen</Badge>}</div></Td>
                        <Td>{u.chats_count}</Td>
                        <Td className="whitespace-nowrap text-xs text-gray-500">{u.last_seen_at ? formatDate(u.last_seen_at) : '–'}</Td>
                        <Td className="whitespace-nowrap text-right">
                            <IconButton label="Bearbeiten" onClick={() => setEditing(u)}><Pencil className="h-4 w-4" /></IconButton>
                            <IconButton label="Löschen" onClick={() => window.confirm(`Benutzer „${u.name}“ samt allen Daten endgültig löschen?`) && router.delete(route('admin.users.destroy', u.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton>
                        </Td>
                    </tr>
                ))}
            </Table>
            {users.links && users.last_page > 1 && (
                <div className="flex flex-wrap justify-center gap-1">{users.links.map((l, i) => l.url ? <Link key={i} href={l.url} preserveScroll className={`rounded-lg px-3 py-1.5 text-sm ${l.active ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`} dangerouslySetInnerHTML={{ __html: l.label }} /> : <span key={i} className="px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: l.label }} />)}</div>
            )}
            <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Benutzer bearbeiten' : 'Benutzer anlegen'}>
                {editing !== undefined && <UserForm key={editing?.id ?? 'new'} user={editing} roles={roles} onClose={() => setEditing(undefined)} />}
            </Modal>
        </AdminLayout>
    );
}
