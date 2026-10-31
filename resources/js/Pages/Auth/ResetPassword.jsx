import { Head, useForm } from '@inertiajs/react';
import { Button, Field, Input } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ResetPassword({ token, email }) {
    const form = useForm({ token, email, password: '', password_confirmation: '' });

    return (
        <GuestLayout title="Neues Passwort festlegen">
            <Head title="Passwort zurücksetzen" />
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('password.store'), { onFinish: () => form.reset('password', 'password_confirmation') }); }} className="space-y-4">
                <Field label="E-Mail" error={form.errors.email}><Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
                <Field label="Neues Passwort" error={form.errors.password}><Input type="password" autoComplete="new-password" autoFocus value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required /></Field>
                <Field label="Passwort bestätigen" error={form.errors.password_confirmation}><Input type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} required /></Field>
                <Button type="submit" className="w-full" loading={form.processing}>Passwort speichern</Button>
            </form>
        </GuestLayout>
    );
}
