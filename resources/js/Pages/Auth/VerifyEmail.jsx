import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Button } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status }) {
    const form = useForm({});

    return (
        <GuestLayout title="E-Mail-Adresse bestätigen" subtitle="Wir haben dir einen Bestätigungslink geschickt. Klicke darauf, um dein Konto zu aktivieren.">
            <Head title="E-Mail bestätigen" />
            {status === 'verification-link-sent' && <div className="mb-4"><Alert type="success">Ein neuer Bestätigungslink wurde gesendet.</Alert></div>}
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('verification.send')); }} className="flex items-center justify-between gap-3">
                <Button type="submit" loading={form.processing}>Link erneut senden</Button>
                <Link href={route('logout')} method="post" as="button" className="text-sm text-gray-500 underline hover:text-gray-800 dark:hover:text-zinc-200">Abmelden</Link>
            </form>
        </GuestLayout>
    );
}
