import AppLayout, { SideTabs } from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/react';

export default function AdminLayout({ title, children }) {
    const { auth } = usePage().props;
    const can = (p) => auth.user.permissions.includes(p) || auth.user.permissions.includes('*');

    const items = [
        { label: 'Übersicht', href: route('admin.dashboard'), active: route().current('admin.dashboard') },
        can('admin.providers') && { label: 'Provider & Modelle', href: route('admin.providers.index'), active: route().current('admin.providers.*') },
        can('admin.features') && { label: 'Funktionen', href: route('admin.features.index'), active: route().current('admin.features.*') },
        can('admin.features') && { label: 'Agenten', href: route('admin.agents.index'), active: route().current('admin.agents.*') },
        can('admin.updates') && { label: 'Updates & Cron', href: route('admin.updates.index'), active: route().current('admin.updates.*') },
        can('admin.users') && { label: 'Benutzer', href: route('admin.users.index'), active: route().current('admin.users.*') },
        can('admin.users') && { label: 'Rollen & Limits', href: route('admin.roles.index'), active: route().current('admin.roles.*') },
        can('admin.settings') && { label: 'Plattform', href: route('admin.settings.index'), active: route().current('admin.settings.*') },
        can('admin.logs') && { label: 'Nutzung & Kosten', href: route('admin.usage'), active: route().current('admin.usage') },
        can('admin.logs') && { label: 'Fehlerprotokoll', href: route('admin.errors'), active: route().current('admin.errors') },
        can('admin.logs') && { label: 'Audit-Log', href: route('admin.audit'), active: route().current('admin.audit') },
        can('admin.logs') && { label: 'Systemstatus', href: route('admin.system'), active: route().current('admin.system') },
    ].filter(Boolean);

    return (
        <AppLayout title={title} wide aside={<SideTabs items={items} />}>
            <div className="space-y-6">{children}</div>
        </AppLayout>
    );
}
