import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MetalFx } from 'metal-fx';

export function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

const buttonVariants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-400',
    secondary: 'bg-white text-gray-800 ring-1 ring-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
};

export function useAppTheme() {
    const read = () => (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    const [theme, setThemeState] = useState(read);

    useEffect(() => {
        const observer = new MutationObserver(() => setThemeState(read()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return theme;
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

/**
 * Metal-Effekt (libraries.dev/metal) um ein beliebiges Button-Element. Folgt dem App-Theme,
 * friert bei "reduzierter Bewegung" oder deaktiviertem Element ein.
 */
export function Metal({ children, variant = 'button', preset = 'chromatic', strength = 1, paused = false, borderRadius = 8, className }) {
    const theme = useAppTheme();
    const reducedMotion = usePrefersReducedMotion();

    return (
        <MetalFx variant={variant} preset={preset} theme={theme} strength={paused ? 0.5 : strength} paused={paused || reducedMotion} borderRadius={borderRadius} className={className}>
            {children}
        </MetalFx>
    );
}

export function Button({ variant = 'primary', size = 'md', loading = false, metal, className, children, ...props }) {
    const button = (
        <button
            {...props}
            disabled={props.disabled || loading}
            className={cx(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
                size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
                buttonVariants[variant],
                className,
            )}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );

    // Primäre Buttons erhalten standardmässig den Metal-Effekt; mit metal={false} abschaltbar.
    if (!(metal ?? variant === 'primary')) {
        return button;
    }

    return <Metal paused={Boolean(props.disabled || loading)}>{button}</Metal>;
}

export function IconButton({ label, className, children, ...props }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            {...props}
            className={cx(
                'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                className,
            )}
        >
            {children}
        </button>
    );
}

const fieldClass =
    'block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 disabled:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-zinc-800';

export function Input({ className, ...props }) {
    return <input {...props} className={cx(fieldClass, className)} />;
}

export function Textarea({ className, rows = 4, ...props }) {
    return <textarea rows={rows} {...props} className={cx(fieldClass, className)} />;
}

export function Select({ className, children, ...props }) {
    return (
        <select {...props} className={cx(fieldClass, 'pr-8', className)}>
            {children}
        </select>
    );
}

export function Field({ label, hint, error, children, className }) {
    return (
        <label className={cx('block space-y-1', className)}>
            {label && <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">{label}</span>}
            {children}
            {hint && !error && <span className="block text-xs text-gray-500 dark:text-zinc-400">{hint}</span>}
            {error && <span className="block text-xs text-red-600">{error}</span>}
        </label>
    );
}

export function Toggle({ checked, onChange, label, description, disabled }) {
    return (
        <div className="flex items-start justify-between gap-4">
            {(label || description) && (
                <div className="min-w-0">
                    {label && <div className="text-sm font-medium text-gray-800 dark:text-zinc-100">{label}</div>}
                    {description && <div className="text-xs text-gray-500 dark:text-zinc-400">{description}</div>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={!!checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cx(
                    'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50',
                    checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-zinc-600',
                )}
            >
                <span className={cx('inline-block h-5 w-5 rounded-full bg-white shadow transition', checked ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
        </div>
    );
}

export function Card({ title, description, actions, children, className }) {
    return (
        <section className={cx('rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900', className)}>
            {(title || actions) && (
                <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
                    <div>
                        {title && <h2 className="text-base font-semibold">{title}</h2>}
                        {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">{description}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

const badgeColors = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    blue: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
};

export function Badge({ color = 'gray', children, className }) {
    return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[color], className)}>{children}</span>;
}

export function Alert({ type = 'info', children }) {
    const styles = {
        info: 'bg-brand-50 text-brand-900 ring-brand-200 dark:bg-brand-900/20 dark:text-brand-100 dark:ring-brand-800',
        success: 'bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-100 dark:ring-emerald-800',
        warning: 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:ring-amber-800',
        error: 'bg-red-50 text-red-900 ring-red-200 dark:bg-red-900/20 dark:text-red-100 dark:ring-red-800',
    };
    return <div role={type === 'error' ? 'alert' : 'status'} className={cx('rounded-xl px-4 py-3 text-sm ring-1', styles[type])}>{children}</div>;
}

export function Modal({ open, onClose, title, children, footer, wide }) {
    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />
            <div className="fixed inset-0 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
                <DialogPanel className={cx('flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl dark:bg-zinc-900 sm:rounded-2xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
                        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
                        <IconButton label="Schliessen" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </IconButton>
                    </div>
                    <div className="space-y-4 overflow-y-auto p-5">{children}</div>
                    {footer && <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3 dark:border-zinc-800">{footer}</div>}
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export function EmptyState({ title, description, children }) {
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-zinc-700">
            <p className="font-medium">{title}</p>
            {description && <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-zinc-400">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}

export function Spinner({ className }) {
    return <Loader2 className={cx('h-4 w-4 animate-spin', className)} />;
}

export function Table({ columns, children, className }) {
    return (
        <div className={cx('overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800', className)}>
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-zinc-800">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                        {columns.map((c) => (
                            <th key={c} className="whitespace-nowrap px-4 py-2.5 font-medium">{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">{children}</tbody>
            </table>
        </div>
    );
}

export function Td({ children, className }) {
    return <td className={cx('px-4 py-2.5 align-top', className)}>{children}</td>;
}
