import { Head } from '@inertiajs/react';
import SettingsLayout from '@/Layouts/SettingsLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <SettingsLayout title="Konto & Passwort">
            <Head title="Konto" />
            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
            <UpdatePasswordForm />
            <DeleteUserForm />
        </SettingsLayout>
    );
}
