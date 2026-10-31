import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Field, IconButton, Textarea } from '@/Components/ui';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { formatDate } from '@/lib/api';

export default function Memory({ memories }) {
    const { features } = usePage().props;
    const status = features.memory;
    const form = useForm({ content: '' });
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState('');

    const add = (e) => {
        e.preventDefault();
        form.post(route('memory.store'), { preserveScroll: true, onSuccess: () => form.reset() });
    };

    const saveEdit = () => {
        router.patch(route('memory.update', editing), { content: draft }, { preserveScroll: true, onSuccess: () => setEditing(null) });
    };

    return (
        <SettingsLayout title="Memory">
            <Head title="Memory" />
            {!(status?.enabled && status?.configured) && <Alert type="warning">Memory ist derzeit nicht aktiv{status?.reason ? `: ${status.reason}` : '.'} Bestehende Einträge bleiben sichtbar und löschbar.</Alert>}
            <Card title="Was die KI über dich gespeichert hat" description="Einträge entstehen automatisch aus Gesprächen oder manuell. Du kannst jeden Eintrag ändern oder löschen; die KI nutzt nur, was hier steht.">
                {memories.length === 0 ? <EmptyState title="Keine Erinnerungen gespeichert" /> : (
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {memories.map((m) => (
                            <li key={m.id} className="flex items-start gap-3 py-3">
                                <div className="min-w-0 flex-1">
                                    {editing === m.id ? (
                                        <div className="space-y-2">
                                            <Textarea rows={2} maxLength={500} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                                            <div className="flex gap-2"><Button size="sm" onClick={saveEdit}>Speichern</Button><Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Abbrechen</Button></div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm">{m.content}</p>
                                            <p className="mt-1 flex items-center gap-2 text-xs text-gray-500"><Badge color={m.source === 'manual' ? 'blue' : 'gray'}>{m.source === 'manual' ? 'Manuell' : 'Automatisch'}</Badge>{formatDate(m.created_at)}</p>
                                        </>
                                    )}
                                </div>
                                {editing !== m.id && (
                                    <div className="flex shrink-0">
                                        <IconButton label="Bearbeiten" onClick={() => { setEditing(m.id); setDraft(m.content); }}><Pencil className="h-4 w-4" /></IconButton>
                                        <IconButton label="Löschen" onClick={() => router.delete(route('memory.destroy', m.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {memories.length > 0 && <div className="mt-4 text-right"><Button variant="danger" size="sm" onClick={() => window.confirm('Alle Erinnerungen löschen?') && router.delete(route('memory.clear'), { preserveScroll: true })}>Alles löschen</Button></div>}
            </Card>
            {status?.enabled && status?.configured && (
                <Card title="Eintrag hinzufügen">
                    <form onSubmit={add} className="space-y-3">
                        <Field error={form.errors.content}><Textarea rows={2} maxLength={500} value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} placeholder="z. B. Ich bevorzuge Antworten auf Deutsch (Schweiz)." required /></Field>
                        <Button type="submit" loading={form.processing}>Speichern</Button>
                    </form>
                </Card>
            )}
        </SettingsLayout>
    );
}
