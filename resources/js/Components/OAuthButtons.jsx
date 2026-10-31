import { usePage } from '@inertiajs/react';

export default function OAuthButtons() {
    const { oauth } = usePage().props;
    const providers = [oauth?.google && ['google', 'Google'], oauth?.github && ['github', 'GitHub']].filter(Boolean);

    if (providers.length === 0) return null;

    return (
        <div className="mt-5">
            <div className="relative mb-4 text-center text-xs text-gray-400"><span className="relative z-10 bg-white px-2 dark:bg-zinc-900">oder</span><div className="absolute inset-x-0 top-1/2 border-t border-gray-200 dark:border-zinc-800" /></div>
            <div className="grid gap-2">
                {providers.map(([key, label]) => (
                    <a key={key} href={route('oauth.redirect', key)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                        <span className="font-bold" aria-hidden="true">{key === 'github' ? 'GH' : 'G'}</span>Mit {label} fortfahren
                    </a>
                ))}
            </div>
        </div>
    );
}
