import { Head, Link, useForm } from '@inertiajs/react';
import OAuthButtons from '@/Components/OAuthButtons';
import { Alert, Button, Field, Input } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const form = useForm({ email: '', password: '', remember: false });
    const submit = (e) => {
        e.preventDefault();
        form.post(route('login'), { onFinish: () => form.reset('password') });
    };

    return (
        <GuestLayout title="Anmelden">
            <Head title="Anmelden" />
            {status && <div className="mb-4"><Alert type="success">{status}</Alert></div>}
            <form onSubmit={submit} className="space-y-4">
                <Field label="E-Mail" error={form.errors.email}><Input type="email" autoComplete="username" autoFocus value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
                <Field label="Passwort" error={form.errors.password}><Input type="password" autoComplete="current-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required /></Field>
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-gray-300 text-brand-600" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} />Angemeldet bleiben</label>
                    {canResetPassword && <Link href={route('password.request')} className="text-brand-600 hover:underline dark:text-brand-300">Passwort vergessen?</Link>}
                </div>
                <Button type="submit" className="w-full" loading={form.processing}>Anmelden</Button>
            </form>
            <OAuthButtons />
            <p className="mt-5 text-center text-sm text-gray-500">Noch kein Konto? <Link href={route('register')} className="text-brand-600 hover:underline dark:text-brand-300">Registrieren</Link></p>
        </GuestLayout>
    );
}
