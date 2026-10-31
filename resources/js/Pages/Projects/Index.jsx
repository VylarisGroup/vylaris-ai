import { Head, Link, router, useForm } from '@inertiajs/react';
import { FolderKanban, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Textarea } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';

export default function ProjectsIndex({ projects }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', description: '', instructions: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('projects.store'), { onSuccess: () => { setOpen(false); form.reset(); } });
    };

    return (
        <AppLayout title="Projekte">
            <Head title="Projekte" />
            <p className="mb-6 max-w-2xl text-sm text-gray-600 dark:text-zinc-400">
                Projekte bündeln Chats, Dateien und Anweisungen. Dateien in der Wissensdatenbank eines Projekts werden bei passenden Fragen automatisch durchsucht (RAG).
            </p>
            <div className="mb-4 flex justify-end">
                <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Neues Projekt</Button>
            </div>

            {projects.length === 0 ? (
                <EmptyState title="Noch keine Projekte" description="Lege ein Projekt an, um Dokumente hochzuladen und projektspezifische Anweisungen zu hinterlegen." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((p) => (
                        <Link key={p.id} href={route('projects.show', p.id)} className="block">
                            <Card className="h-full transition hover:border-brand-300 dark:hover:border-brand-700">
                                <div className="flex items-start gap-3">
                                    <FolderKanban className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold">{p.name}</h3>
                                        {p.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">{p.description}</p>}
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            <Badge>{p.chats_count} Chats</Badge>
                                            <Badge>{p.files_count} Dateien</Badge>
                                            {p.archived && <Badge color="amber">Archiviert</Badge>}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <Modal open={open} onClose={() => setOpen(false)} title="Neues Projekt" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Abbrechen</Button><Button loading={form.processing} onClick={submit}>Anlegen</Button></>}>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required maxLength={120} autoFocus /></Field>
                    <Field label="Beschreibung" error={form.errors.description}><Textarea rows={2} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} maxLength={1000} /></Field>
                    <Field label="Projektanweisungen" hint="Gelten für alle Chats im Projekt." error={form.errors.instructions}><Textarea rows={4} value={form.data.instructions} onChange={(e) => form.setData('instructions', e.target.value)} maxLength={10000} /></Field>
                </form>
            </Modal>
        </AppLayout>
    );
}
