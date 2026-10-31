import { Link } from '@inertiajs/react';
import { Card } from '@/Components/ui';

export default function DeleteUserForm() {
    return (
        <Card title="Konto löschen" description="Das vollständige Löschen deines Kontos samt aller Daten findest du unter „Datenschutz & Daten“.">
            <Link href={route('privacy.index')} className="text-sm text-brand-600 hover:underline dark:text-brand-300">Zu Datenschutz & Daten →</Link>
        </Card>
    );
}
