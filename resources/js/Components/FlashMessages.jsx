import { usePage } from '@inertiajs/react';
import { Alert } from '@/Components/ui';

export default function FlashMessages() {
    const { flash } = usePage().props;

    if (!flash?.success && !flash?.error) return null;

    return (
        <div className="mb-4 space-y-2">
            {flash.success && <Alert type="success">{flash.success}</Alert>}
            {flash.error && <Alert type="error">{flash.error}</Alert>}
        </div>
    );
}
