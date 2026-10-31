import { Head, useForm } from '@inertiajs/react';
import { Button, Field, Input } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ConfirmPassword() {
    const form = useForm({ password: '' });

    return (
        <GuestLayout title="Passwort bestätigen" subtitle="Dies ist ein geschützter Bereich. Bitte bestätige dein Passwort.">
            <Head title="Passwort bestätigen" />
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('password.confirm'), { onFinish: () => form.reset('password') }); }} className="space-y-4">
                <Field label="Passwort" error={form.errors.password}><Input type="password" autoFocus value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required /></Field>
                <Button type="submit" className="w-full" loading={form.processing}>Bestätigen</Button>
            </form>
        </GuestLayout>
    );
}
