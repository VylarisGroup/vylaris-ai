import { ThinkingOrb } from 'thinking-orbs';

/**
 * Bot-Avatar auf Basis der Thinking Orbs (libraries.dev, MIT). Der Zustand spiegelt wider, was der Assistent gerade tut.
 */
export default function BotAvatar({ state = 'breathing', size = 20, paused = false }) {
    return (
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-100 p-1 dark:bg-zinc-800" style={{ width: size + 12, height: size + 12 }}>
            <ThinkingOrb state={state} size={size === 20 ? 20 : 64} paused={paused} theme="auto" style={{ width: size, height: size }} />
        </span>
    );
}

/**
 * Ermittelt die zur aktuellen Phase einer ladenden Antwort passende Orb-Animation samt Beschriftung.
 */
export function orbPhase(message) {
    const running = (message?.tool_events || []).filter((t) => t.status === 'running').pop();

    if (running) {
        const name = String(running.name || '');
        if (/search|web|fetch|browse|source/i.test(name)) return { state: 'searching', label: 'Recherchiert…' };
        if (/image|picture|draw/i.test(name)) return { state: 'shaping', label: 'Erzeugt ein Bild…' };
        if (/document|file_create|export|write|pdf|docx|xlsx/i.test(name)) return { state: 'weaving', label: 'Erstellt ein Dokument…' };
        if (/read|file|table|analy|calc|code|memory/i.test(name)) return { state: 'solving', label: 'Analysiert…' };

        return { state: 'working', label: `${running.summary || 'Arbeitet'}…` };
    }

    if (message?.content) return { state: 'composing', label: 'Schreibt…' };
    if (message?.reasoning) return { state: 'solving', label: 'Überlegt…' };
    if (!message) return { state: 'connecting', label: 'Verbindet…' };

    return { state: 'working', label: 'Denkt nach…' };
}

/**
 * Sichtbarer Lade-Indikator mit passendem ThinkingOrb.
 */
export function OrbLoader({ state, label }) {
    return (
        <div className="flex items-center gap-2 py-1 text-sm text-gray-500 dark:text-zinc-400" role="status" aria-label={label}>
            <ThinkingOrb state={state} size={20} theme="auto" style={{ width: 20, height: 20 }} />
            <span>{label}</span>
        </div>
    );
}

/**
 * Platzhalter, solange noch keine Assistenten-Nachricht existiert (zwischen Senden und Antwortbeginn).
 */
export function PendingAssistant() {
    return (
        <div className="flex gap-3" data-testid="pending-assistant">
            <BotAvatar state="connecting" />
            <div className="min-w-0 flex-1">
                <OrbLoader state="connecting" label="Verbindet…" />
            </div>
        </div>
    );
}
