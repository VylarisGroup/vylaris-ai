import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Field, IconButton, Input, Modal, Textarea, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';

function RoleForm({ role, permissions, onClose }) {
    const lim = role?.limits || {};
    const form = useForm({
        name: role?.name || '', description: role?.description || '', permissions: role?.permissions || [], is_default: role?.is_default ?? false,
        limits: { messages_per_day: lim.messages_per_day ?? '', tokens_per_month: lim.tokens_per_month ?? '', uploads_per_day: lim.uploads_per_day ?? '' },
    });
    const all = form.data.permissions.includes('*');
    const toggle = (k) => form.setData('permissions', form.data.permissions.includes(k) ? form.data.permissions.filter((x) => x !== k) : [...form.data.permissions, k]);
    const setLimit = (k, v) => form.setData('limits', { ...form.data.limits, [k]: v });

    const submit = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, limits: Object.fromEntries(Object.entries(d.limits).filter(([, v]) => v !== '' && v !== null)) }));
        const opts = { preserveScroll: true, onSuccess: onClose };
        role ? form.patch(route('admin.roles.update', role.id), opts) : form.post(route('admin.roles.store'), opts);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
            <Field label="Beschreibung"><Textarea rows={2} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
            <Toggle checked={all} onChange={(v) => form.setData('permissions', v ? ['*'] : [])} label="Vollzugriff (alle Rechte)" />
            {!all && <div className="grid gap-2 sm:grid-cols-2">{permissions.map((p) => <label key={p.key} className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-gray-300 text-brand-600" checked={form.data.permissions.includes(p.key)} onChange={() => toggle(p.key)} />{p.label}</label>)}</div>}
            <div>
                <p className="mb-1 text-sm font-medium">Limits (leer = unbegrenzt)</p>
                <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Nachrichten/Tag"><Input type="number" min="0" value={form.data.limits.messages_per_day} onChange={(e) => setLimit('messages_per_day', e.target.value)} /></Field>
                    <Field label="Tokens/Monat"><Input type="number" min="0" value={form.data.limits.tokens_per_month} onChange={(e) => setLimit('tokens_per_month', e.target.value)} /></Field>
                    <Field label="Uploads/Tag"><Input type="number" min="0" value={form.data.limits.uploads_per_day} onChange={(e) => setLimit('uploads_per_day', e.target.value)} /></Field>
                </div>
            </div>
            <Toggle checked={form.data.is_default} onChange={(v) => form.setData('is_default', v)} label="Standardrolle für neue Benutzer" />
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button><Button type="submit" loading={form.processing}>Speichern</Button></div>
        </form>
    );
}

export default function Roles({ roles, permissions }) {
    const [editing, setEditing] = useState(undefined);

    return (
        <AdminLayout title="Rollen & Limits">
            <Head title="Rollen" />
            <div className="flex justify-end"><Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Neue Rolle</Button></div>
            <div className="grid gap-4 md:grid-cols-2">
                {roles.map((r) => (
                    <Card key={r.id} title={r.name} description={r.description} actions={<><IconButton label="Bearbeiten" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></IconButton>{!r.is_system && <IconButton label="Löschen" onClick={() => window.confirm(`Rolle „${r.name}“ löschen?`) && router.delete(route('admin.roles.destroy', r.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton>}</>}>
                        <div className="flex flex-wrap gap-1.5"><Badge>{r.users_count} Benutzer</Badge>{r.is_default && <Badge color="blue">Standard</Badge>}{(r.permissions || []).includes('*') ? <Badge color="amber">Vollzugriff</Badge> : <Badge>{(r.permissions || []).length} Rechte</Badge>}</div>
                    </Card>
                ))}
            </div>
            <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Rolle bearbeiten' : 'Neue Rolle'} wide>
                {editing !== undefined && <RoleForm key={editing?.id ?? 'new'} role={editing} permissions={permissions} onClose={() => setEditing(undefined)} />}
            </Modal>
        </AdminLayout>
    );
}
