import AppLayout, { SideTabs } from '@/Layouts/AppLayout';

export default function SettingsLayout({ title, children }) {
    const items = [
        { label: 'Persönlich & KI', href: route('settings.edit'), active: route().current('settings.*') },
        { label: 'Abo & Nutzung', href: route('billing.index'), active: route().current('billing.*') },
        { label: 'Memory', href: route('memory.index'), active: route().current('memory.*') },
        { label: 'Dateien', href: route('files.index'), active: route().current('files.index') },
        { label: 'Datenschutz & Daten', href: route('privacy.index'), active: route().current('privacy.*') },
        { label: 'Konto & Passwort', href: route('profile.edit'), active: route().current('profile.*') },
    ];

    return (
        <AppLayout title={title} aside={<SideTabs items={items} />}>
            <div className="space-y-6">{children}</div>
        </AppLayout>
    );
}
