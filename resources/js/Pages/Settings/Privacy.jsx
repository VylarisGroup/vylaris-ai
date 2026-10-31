import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Field, Input, Modal } from '@/Components/ui';
import SettingsLayout from '@/Layouts/SettingsLayout';

export default function Privacy({ hasExport, stats }) {
    const [confirmChats, setConfirmChats] = useState(false);
    const [confirmAccount, setConfirmAccount] = useState(false);
    const form = useForm({ password: '' });

    const deleteAccount = (e) => {
        e.preventDefault();
        form.delete(route('profile.destroy'), { preserveScroll: true, onFinish: () => form.reset('password') });
    };

    return (
        <SettingsLayout title="Datenschutz & Daten">
            <Head title="Datenschutz" />
            <Card title="Deine Daten" description="Entsprechend dem Schweizer DSG und der DSGVO hast du Auskunft, Export und Löschung.">
                <dl className="grid grid-cols-3 gap-4 text-center">
                    {[['Chats', stats.chats], ['Dateien', stats.files], ['Erinnerungen', stats.memories]].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-gray-50 p-4 dark:bg-zinc-800/50"><dd className="text-2xl font-semibold">{value}</dd><dt className="text-xs text-gray-500">{label}</dt></div>
                    ))}
                </dl>
                <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400">Deine Nachrichten werden zur Beantwortung an den vom Administrator konfigurierten KI-Anbieter übertragen (externe API). Es werden keine lokalen Modelle verwendet.</p>
            </Card>

            <Card title="Datenexport" description="Erstellt ein ZIP mit Profil, Chats, Erinnerungen und Dateien. Du erhältst eine E-Mail, sobald es bereit ist.">
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => router.post(route('privacy.export'), {}, { preserveScroll: true })}>Export anfordern</Button>
                    {hasExport && <a href={route('privacy.export.download')}><Button variant="secondary"><Download className="h-4 w-4" /> Letzten Export herunterladen</Button></a>}
                </div>
            </Card>

            <Card title="Löschen">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Alle Chats löschen</p><p className="text-sm text-gray-500">Entfernt sämtliche Unterhaltungen und deren Anhänge.</p></div><Button variant="danger" onClick={() => setConfirmChats(true)}>Chats löschen</Button></div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800"><div><p className="font-medium">Konto vollständig löschen</p><p className="text-sm text-gray-500">Löscht Konto, Chats, Dateien, Erinnerungen und Einstellungen unwiderruflich.</p></div><Button variant="danger" onClick={() => setConfirmAccount(true)}>Konto löschen</Button></div>
                </div>
            </Card>

            <Modal open={confirmChats} onClose={() => setConfirmChats(false)} title="Alle Chats löschen?" footer={<><Button variant="secondary" onClick={() => setConfirmChats(false)}>Abbrechen</Button><Button variant="danger" onClick={() => router.delete(route('privacy.chats.destroy'), { onSuccess: () => setConfirmChats(false) })}>Endgültig löschen</Button></>}>
                <p className="text-sm">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </Modal>

            <Modal open={confirmAccount} onClose={() => setConfirmAccount(false)} title="Konto löschen?" footer={<><Button variant="secondary" onClick={() => setConfirmAccount(false)}>Abbrechen</Button><Button variant="danger" loading={form.processing} onClick={deleteAccount}>Konto endgültig löschen</Button></>}>
                <form onSubmit={deleteAccount}><Field label="Passwort zur Bestätigung" error={form.errors.password}><Input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} autoComplete="current-password" required /></Field></form>
            </Modal>
        </SettingsLayout>
    );
}
