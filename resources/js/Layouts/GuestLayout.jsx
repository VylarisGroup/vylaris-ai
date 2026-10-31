import { Link, usePage } from '@inertiajs/react';
import FlashMessages from '@/Components/FlashMessages';
import ThemeToggle from '@/Components/ThemeToggle';
import { useThemeSync } from '@/Layouts/AppLayout';

export default function GuestLayout({ children, title, subtitle, wide = false }) {
    const { app } = usePage().props;
    useThemeSync();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10 dark:bg-zinc-950">
            <div className="absolute right-4 top-4"><ThemeToggle /></div>
            <Link href="/" className="mb-6 flex items-center gap-2 text-lg font-semibold">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">V</span>
                {app?.name || 'Vylaris AI'}
            </Link>
            <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}>
                {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>}
                <div className={title ? 'mt-5' : ''}><FlashMessages />{children}</div>
            </div>
        </div>
    );
}
