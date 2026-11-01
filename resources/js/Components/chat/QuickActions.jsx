import { ArrowDown, Plus, SquarePen } from 'lucide-react';
import { Liquid } from 'liquid-gooey';
import { useEffect, useState } from 'react';
import { useAppTheme } from '@/Components/ui';

/**
 * Schwebendes Schnellmenü im Chat (Gooey-Effekt, libraries.dev): Die Aktionen lösen sich beim Öffnen
 * wie Tropfen vom Hauptknopf ab. Esc und Klick auf den Hauptknopf schliessen es wieder.
 */
export default function QuickActions({ onNewChat, onScrollToBottom, className }) {
    const [open, setOpen] = useState(false);
    const dark = useAppTheme() === 'dark';

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const base = `inline-flex h-11 w-11 items-center justify-center rounded-full ${dark ? 'text-zinc-900' : 'text-white'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600`;
    const run = (fn) => () => {
        setOpen(false);
        fn();
    };

    return (
        <div className={className}>
            <Liquid blur={6} contrast={18} fill={dark ? '#f4f4f5' : '#111827'} shadow="0 4px 14px rgba(0,0,0,.25)" filterPadding={140} className="h-11 w-11">
                <Liquid.Item x={0} y={open ? -56 : 0} transition="bouncy" delay={open ? 40 : 0} className="absolute bottom-0 right-0 h-11 w-11">
                    <button type="button" className={base} aria-label="Zum Ende scrollen" title="Zum Ende scrollen" tabIndex={open ? 0 : -1} aria-hidden={!open} onClick={run(onScrollToBottom)} style={{ pointerEvents: open ? 'auto' : 'none', opacity: open ? 1 : 0, transition: 'opacity 160ms' }}>
                        <ArrowDown className="h-5 w-5" />
                    </button>
                </Liquid.Item>
                <Liquid.Item x={0} y={open ? -112 : 0} transition="bouncy" delay={open ? 80 : 0} className="absolute bottom-0 right-0 h-11 w-11">
                    <button type="button" className={base} aria-label="Neuer Chat" title="Neuer Chat" tabIndex={open ? 0 : -1} aria-hidden={!open} onClick={run(onNewChat)} style={{ pointerEvents: open ? 'auto' : 'none', opacity: open ? 1 : 0, transition: 'opacity 160ms' }}>
                        <SquarePen className="h-5 w-5" />
                    </button>
                </Liquid.Item>
                <Liquid.Item className="absolute bottom-0 right-0 h-11 w-11">
                    <button type="button" className={base} aria-label={open ? 'Schnellmenü schliessen' : 'Schnellmenü öffnen'} aria-expanded={open} title="Schnellmenü" onClick={() => setOpen((v) => !v)}>
                        <Plus className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
                    </button>
                </Liquid.Item>
            </Liquid>
        </div>
    );
}
