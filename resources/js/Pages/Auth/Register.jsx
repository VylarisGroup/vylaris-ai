import { Head, Link, useForm } from '@inertiajs/react';
import OAuthButtons from '@/Components/OAuthButtons';
import { Button, Field, Input } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    const form = useForm({ name: '', email: '', password: '', password_confirmation: '' });
    const submit = (e) => {
        e.preventDefault();
        form.post(route('register'), { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout title="Konto erstellen" subtitle="Mit der Registrierung stimmst du der Verarbeitung deiner Daten gemäss Datenschutzerklärung (DSG/DSGVO) zu. Deine Eingaben werden zur Beantwortung an externe KI-Anbieter übermittelt.">
            <Head title="Registrieren" />
            <form onSubmit={submit} className="space-y-4">
                <Field label="Name" error={form.errors.name}><Input autoComplete="name" autoFocus value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
                <Field label="E-Mail" error={form.errors.email}><Input type="email" autoComplete="username" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
                <Field label="Passwort" error={form.errors.password}><Input type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required /></Field>
                <Field label="Passwort bestätigen" error={form.errors.password_confirmation}><Input type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} required /></Field>
                <Button type="submit" className="w-full" loading={form.processing}>Registrieren</Button>
            </form>
            <OAuthButtons />
            <p className="mt-5 text-center text-sm text-gray-500">Bereits registriert? <Link href={route('login')} className="text-brand-600 hover:underline dark:text-brand-300">Anmelden</Link></p>
        </GuestLayout>
    );
}
