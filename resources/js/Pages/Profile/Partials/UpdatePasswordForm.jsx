import { useForm } from '@inertiajs/react';
import { Button, Card, Field, Input } from '@/Components/ui';

export default function UpdatePasswordForm() {
    const form = useForm({ current_password: '', password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('password.update'), { preserveScroll: true, onSuccess: () => form.reset(), onError: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <Card title="Passwort ändern" description="Verwende ein langes, einzigartiges Passwort.">
            <form onSubmit={submit} className="max-w-xl space-y-4">
                <Field label="Aktuelles Passwort" error={form.errors.current_password}><Input type="password" autoComplete="current-password" value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} /></Field>
                <Field label="Neues Passwort" error={form.errors.password}><Input type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} /></Field>
                <Field label="Neues Passwort bestätigen" error={form.errors.password_confirmation}><Input type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} /></Field>
                <div className="flex items-center gap-3"><Button type="submit" loading={form.processing}>Passwort speichern</Button>{form.recentlySuccessful && <span className="text-sm text-emerald-600">Gespeichert.</span>}</div>
            </form>
        </Card>
    );
}
