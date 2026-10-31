import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Field, Input } from '@/Components/ui';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const form = useForm({ name: user.name, email: user.email });

    return (
        <Card title="Profil" description="Name und E-Mail-Adresse. Bei einer neuen E-Mail-Adresse ist eine erneute Bestätigung nötig.">
            <form onSubmit={(e) => { e.preventDefault(); form.patch(route('profile.update'), { preserveScroll: true }); }} className="max-w-xl space-y-4">
                <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required autoComplete="name" /></Field>
                <Field label="E-Mail" error={form.errors.email}><Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required autoComplete="username" /></Field>
                {mustVerifyEmail && !user.email_verified && (
                    <Alert type="warning">Deine E-Mail-Adresse ist noch nicht bestätigt. <Link href={route('verification.send')} method="post" as="button" className="underline">Bestätigungslink erneut senden</Link>{status === 'verification-link-sent' && ' – gesendet.'}</Alert>
                )}
                <div className="flex items-center gap-3"><Button type="submit" loading={form.processing}>Speichern</Button>{form.recentlySuccessful && <span className="text-sm text-emerald-600">Gespeichert.</span>}</div>
            </form>
        </Card>
    );
}
