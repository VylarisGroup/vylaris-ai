import { Link, usePage } from '@inertiajs/react';
import { LogOut, MessageSquare, FolderKanban, Settings, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import FlashMessages from '@/Components/FlashMessages';
import ThemeToggle from '@/Components/ThemeToggle';
import { cx } from '@/Components/ui';
import { applyTheme, currentTheme } from '@/lib/theme';

export function NavLinks({ className }) {
    const { auth } = usePage().props;
    const items = [
        { label: 'Chat', href: route('chat.index'), icon: MessageSquare, active: route().current('chat.*') },
        { label: 'Projekte', href: route('projects.index'), icon: FolderKanban, active: route().current('projects.*') },
        { label: 'Einstellungen', href: route('settings.edit'), icon: Settings, active: route().current('settings.*') || route().current('memory.*') || route().current('files.index') || route().current('privacy.*') || route().current('profile.*') },
    ];

    if (auth.user?.is_admin) {
        items.push({ label: 'Admin', href: route('admin.dashboard'), icon: ShieldCheck, active: route().current('admin.*') });
    }

    return (
        <nav className={cx('flex items-center gap-1', className)} aria-label="Hauptnavigation">
            {items.map(({ label, href, icon: Icon, active }) => (
                <Link
                    key={label}
                    href={href}
                    className={cx(
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                        active ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                </Link>
            ))}
        </nav>
    );
}

export function useThemeSync() {
    const { auth } = usePage().props;

    useEffect(() => {
        try {
            if (!localStorage.getItem('theme') && auth.user?.preferences?.theme) {
                applyTheme(auth.user.preferences.theme);
            } else {
                applyTheme(currentTheme());
            }
        } catch (e) {
            // ignoriert
        }
    }, []);
}

export default function AppLayout({ title, children, wide = false, aside }) {
    const { auth, app } = usePage().props;
    useThemeSync();

    return (
        <div className="min-h-full bg-gray-50 dark:bg-zinc-950">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
                    <Link href={route('chat.index')} className="flex items-center gap-2 font-semibold">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">V</span>
                        <span className="hidden sm:inline">{app.name}</span>
                    </Link>
                    <NavLinks />
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <span className="hidden text-sm text-gray-500 md:inline dark:text-zinc-400">{auth.user?.name}</span>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            aria-label="Abmelden"
                            title="Abmelden"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className={cx('mx-auto px-4 py-8', wide ? 'max-w-7xl' : 'max-w-5xl')}>
                {title && <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>}
                <div className={aside ? 'grid gap-6 md:grid-cols-[220px_1fr]' : ''}>
                    {aside}
                    <div className="min-w-0">
                        <FlashMessages />
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

export function SideTabs({ items }) {
    return (
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Unternavigation">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                        'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
                        item.active ? 'bg-white text-brand-700 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:text-brand-200 dark:ring-zinc-800' : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
