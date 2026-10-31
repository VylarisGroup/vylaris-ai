import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, Modal, Select, Textarea, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';

function AgentForm({ agent, tools, models, onClose }) {
    const form = useForm({ name: agent?.name || '', description: agent?.description || '', instructions: agent?.instructions || '', tools: agent?.tools || [], ai_model_id: agent?.ai_model_id ?? '', max_steps: agent?.max_steps ?? 8, is_enabled: agent?.is_enabled ?? true });

    const submit = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, ai_model_id: d.ai_model_id === '' ? null : Number(d.ai_model_id) }));
        const opts = { preserveScroll: true, onSuccess: onClose };
        agent ? form.patch(route('admin.agents.update', agent.id), opts) : form.post(route('admin.agents.store'), opts);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
            <Field label="Beschreibung" error={form.errors.description}><Input value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
            <Field label="Anweisungen / Vorgehen" hint="Beschreibt Rolle, Vorgehen und Ausgabeformat des Agenten." error={form.errors.instructions}><Textarea rows={6} value={form.data.instructions} onChange={(e) => form.setData('instructions', e.target.value)} required /></Field>
            <div>
                <p className="mb-1 text-sm font-medium">Erlaubte Werkzeuge</p>
                <div className="grid gap-2 sm:grid-cols-2">{tools.map((t) => <label key={t.key} className="flex items-start gap-2 rounded-lg border border-gray-200 p-2 text-sm dark:border-zinc-700"><input type="checkbox" className="mt-0.5 rounded border-gray-300 text-brand-600" checked={form.data.tools.includes(t.key)} onChange={() => form.setData('tools', form.data.tools.includes(t.key) ? form.data.tools.filter((x) => x !== t.key) : [...form.data.tools, t.key])} /><span><span className="font-medium">{t.label}</span><span className="block text-xs text-gray-500">{t.description}</span></span></label>)}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Modell (muss Tools unterstützen)" error={form.errors.ai_model_id}><Select value={form.data.ai_model_id} onChange={(e) => form.setData('ai_model_id', e.target.value)}><option value="">Automatisch</option>{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select></Field>
                <Field label="Max. Schritte" error={form.errors.max_steps}><Input type="number" min="1" max="20" value={form.data.max_steps} onChange={(e) => form.setData('max_steps', e.target.value)} /></Field>
            </div>
            <Toggle checked={form.data.is_enabled} onChange={(v) => form.setData('is_enabled', v)} label="Für Benutzer sichtbar" />
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button><Button type="submit" loading={form.processing}>Speichern</Button></div>
        </form>
    );
}

export default function Agents({ agents, tools, models }) {
    const [editing, setEditing] = useState(undefined);

    return (
        <AdminLayout title="Agenten">
            <Head title="Agenten" />
            <div className="flex items-center justify-between gap-4">
                <p className="max-w-2xl text-sm text-gray-600 dark:text-zinc-400">Agenten führen mehrstufige Aufgaben aus: Sie planen, rufen Werkzeuge auf (Websuche, Dokumente, Dateien …) und liefern ein Ergebnis. Benutzer wählen sie im Chat-Eingabefeld.</p>
                <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Neuer Agent</Button>
            </div>
            {agents.length === 0 ? <EmptyState title="Noch keine Agenten definiert" /> : (
                <div className="grid gap-4 md:grid-cols-2">
                    {agents.map((a) => (
                        <Card key={a.id} title={a.name} description={a.description} actions={<><IconButton label="Bearbeiten" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></IconButton><IconButton label="Löschen" onClick={() => window.confirm(`Agent „${a.name}“ löschen?`) && router.delete(route('admin.agents.destroy', a.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton></>}>
                            <div className="flex flex-wrap gap-1.5"><Badge color={a.is_enabled ? 'green' : 'gray'}>{a.is_enabled ? 'Aktiv' : 'Inaktiv'}</Badge><Badge>{a.max_steps} Schritte</Badge>{(a.tools || []).map((t) => <Badge key={t} color="blue">{t}</Badge>)}</div>
                        </Card>
                    ))}
                </div>
            )}
            <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Agent bearbeiten' : 'Neuer Agent'} wide>
                {editing !== undefined && <AgentForm key={editing?.id ?? 'new'} agent={editing} tools={tools} models={models} onClose={() => setEditing(undefined)} />}
            </Modal>
        </AdminLayout>
    );
}
