import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Button, Field, Input } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword({ status }) {
    const form = useForm({ email: '' });

    return (
        <GuestLayout title="Passwort zurücksetzen" subtitle="Wir senden dir einen Link zum Festlegen eines neuen Passworts.">
            <Head title="Passwort vergessen" />
            {status && <div className="mb-4"><Alert type="success">{status}</Alert></div>}
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('password.email')); }} className="space-y-4">
                <Field label="E-Mail" error={form.errors.email}><Input type="email" autoFocus value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
                <Button type="submit" className="w-full" loading={form.processing}>Link senden</Button>
            </form>
            <p className="mt-5 text-center text-sm"><Link href={route('login')} className="text-brand-600 hover:underline dark:text-brand-300">Zurück zur Anmeldung</Link></p>
        </GuestLayout>
    );
}
