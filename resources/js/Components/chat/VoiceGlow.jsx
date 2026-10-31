/**
 * Visueller Sprachindikator (Voice Glow): weiches Leuchten, das mit dem Pegel wächst.
 * Hinweis: libraries.dev bietet "Voice" derzeit nicht als installierbares Paket an;
 * diese Komponente ist eine eigene, abhängigkeitsfreie Umsetzung des Effekts.
 */
export default function VoiceGlow({ level = 0, active = false, className = '' }) {
    const scale = 1 + level * 0.9;

    return (
        <span className={`pointer-events-none relative inline-flex h-10 w-10 items-center justify-center ${className}`} aria-hidden="true">
            <span
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500 via-fuchsia-500 to-sky-400 blur-md transition-transform duration-100"
                style={{ opacity: active ? 0.35 + level * 0.55 : 0, transform: `scale(${scale})` }}
            />
            <span
                className="absolute inset-1 rounded-full bg-gradient-to-tr from-brand-500 to-fuchsia-500 transition-transform duration-100"
                style={{ opacity: active ? 0.9 : 0, transform: `scale(${1 + level * 0.35})` }}
            />
        </span>
    );
}
