import { Head, Link, router, useForm } from '@inertiajs/react';
import { Database, FileText, MessageSquarePlus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Field, IconButton, Input, Textarea, Toggle } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';
import { api, errorMessage, formatBytes, formatDate } from '@/lib/api';

const statusBadge = { pending: ['gray', 'Wartet'], processing: ['blue', 'Wird verarbeitet'], ready: ['green', 'Bereit'], failed: ['red', 'Fehlgeschlagen'] };

export default function ProjectShow({ project, files: initialFiles, chats }) {
    const form = useForm({ name: project.name, description: project.description || '', instructions: project.instructions || '', archived: project.archived });
    const [files, setFiles] = useState(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [knowledge, setKnowledge] = useState(true);
    const input = useRef(null);

    useEffect(() => setFiles(initialFiles), [initialFiles]);

    // Verarbeitungsstatus nachladen, solange Dateien nicht fertig sind
    useEffect(() => {
        const pending = files.filter((f) => ['pending', 'processing'].includes(f.status));
        if (!pending.length) return undefined;
        const timer = setInterval(async () => {
            try {
                const data = await api.get(route('files.status', { ids: pending.map((f) => f.id).join(',') }));
                const list = data.files || data;
                setFiles((current) => current.map((f) => list.find((x) => x.id === f.id) ? { ...f, ...list.find((x) => x.id === f.id) } : f));
            } catch (e) {
                // nächster Versuch
            }
        }, 2000);
        return () => clearInterval(timer);
    }, [files]);

    const upload = async (fileList) => {
        if (!fileList?.length) return;
        setUploading(true);
        setError(null);
        const body = new FormData();
        Array.from(fileList).forEach((f) => body.append('files[]', f));
        body.append('project_id', project.id);
        body.append('knowledge', knowledge ? '1' : '0');
        try {
            const data = await api.post(route('files.store'), body);
            if (data.errors?.length) setError(data.errors.join(' '));
            router.reload({ only: ['files'] });
        } catch (e) {
            setError(errorMessage(e, 'Upload fehlgeschlagen.'));
            const errs = e?.response?.data?.errors;
            if (Array.isArray(errs) && errs.length) setError(errs.join(' '));
        } finally {
            setUploading(false);
            if (input.current) input.current.value = '';
        }
    };

    const toggleKb = async (file, value) => {
        setFiles((list) => list.map((f) => (f.id === file.id ? { ...f, in_knowledge_base: value } : f)));
        try {
            await api.patch(route('files.update', file.id), { in_knowledge_base: value });
        } catch (e) {
            setError(errorMessage(e));
        }
    };

    const removeFile = async (file) => {
        if (!window.confirm(`„${file.name}“ löschen?`)) return;
        await api.delete(route('files.destroy', file.id));
        setFiles((list) => list.filter((f) => f.id !== file.id));
    };

    const save = (e) => {
        e.preventDefault();
        form.patch(route('projects.update', project.id), { preserveScroll: true });
    };

    const destroy = () => {
        if (window.confirm('Projekt samt Dateien endgültig löschen? Die Chats bleiben ohne Projekt erhalten.')) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    return (
        <AppLayout title={project.name}>
            <Head title={project.name} />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <Card title="Wissensdatenbank & Dateien" description="Dateien im Wissensspeicher werden zerlegt und bei passenden Fragen als Kontext herangezogen." actions={
                        <>
                            <input ref={input} type="file" multiple className="sr-only" id="project-upload" onChange={(e) => upload(e.target.files)} accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.webp,.gif" />
                            <Button variant="secondary" size="sm" loading={uploading} onClick={() => input.current?.click()}><Upload className="h-4 w-4" /> Hochladen</Button>
                        </>
                    }>
                        <div className="mb-4"><Toggle checked={knowledge} onChange={setKnowledge} label="Neue Uploads in die Wissensdatenbank aufnehmen" description="Nur für Textdokumente; Bilder werden nicht indexiert." /></div>
                        {error && <div className="mb-3"><Alert type="error">{error}</Alert></div>}
                        {files.length === 0 ? <EmptyState title="Noch keine Dateien" description="PDF, DOCX, XLSX, CSV, TXT, Markdown oder Bilder." /> : (
                            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {files.map((f) => {
                                    const [color, label] = statusBadge[f.status] || ['gray', f.status];
                                    return (
                                        <li key={f.id} className="flex flex-wrap items-center gap-3 py-3">
                                            <FileText className="h-5 w-5 shrink-0 text-gray-400" />
                                            <div className="min-w-0 flex-1">
                                                <a href={route('files.show', { file: f.id, download: 1 })} className="block truncate text-sm font-medium hover:underline">{f.name}</a>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    <span>{formatBytes(f.size)}</span><Badge color={color}>{label}</Badge>
                                                    {f.status_message && <span className="text-red-600">{f.status_message}</span>}
                                                </div>
                                            </div>
                                            {f.kind !== 'image' && (
                                                <div className="flex items-center gap-2 text-xs"><Database className="h-4 w-4 text-gray-400" /><Toggle checked={f.in_knowledge_base} onChange={(v) => toggleKb(f, v)} label="In Wissensdatenbank" /></div>
                                            )}
                                            <IconButton label="Datei löschen" onClick={() => removeFile(f)}><Trash2 className="h-4 w-4" /></IconButton>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>

                    <Card title="Chats" actions={<Link href={route('chat.index', { project: project.id })}><Button size="sm"><MessageSquarePlus className="h-4 w-4" /> Neuer Chat</Button></Link>}>
                        {chats.length === 0 ? <p className="text-sm text-gray-500">Noch keine Chats in diesem Projekt.</p> : (
                            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {chats.map((c) => <li key={c.id}><Link href={route('chat.show', c.id)} className="flex items-center justify-between py-2.5 text-sm hover:text-brand-600"><span className="truncate">{c.title}</span><span className="ml-3 shrink-0 text-xs text-gray-400">{formatDate(c.last_message_at)}</span></Link></li>)}
                            </ul>
                        )}
                    </Card>
                </div>

                <form onSubmit={save} className="space-y-4 self-start rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="font-semibold">Einstellungen</h2>
                    <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
                    <Field label="Beschreibung" error={form.errors.description}><Textarea rows={2} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
                    <Field label="Projektanweisungen" error={form.errors.instructions}><Textarea rows={6} value={form.data.instructions} onChange={(e) => form.setData('instructions', e.target.value)} /></Field>
                    <Toggle checked={form.data.archived} onChange={(v) => form.setData('archived', v)} label="Archiviert" />
                    <div className="flex justify-between gap-2 pt-2">
                        <Button type="button" variant="danger" size="sm" onClick={destroy}>Löschen</Button>
                        <Button type="submit" loading={form.processing}>Speichern</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
