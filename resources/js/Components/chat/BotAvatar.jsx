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
