import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { AlertTriangle, ChevronRight, Download, FileText, Loader2, Pencil, RefreshCw, ThumbsDown, ThumbsUp, Volume2, VolumeX, Copy, Check, Globe, Wrench } from 'lucide-react';
import { memo, useState } from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import BotAvatar from '@/Components/chat/BotAvatar';
import Markdown from '@/Components/chat/Markdown';
import { Button, IconButton, Textarea, cx } from '@/Components/ui';
import { useTts } from '@/hooks/useVoice';
import { api, errorMessage, formatBytes } from '@/lib/api';

const exportFormats = [
    { id: 'docx', label: 'Word (.docx)' },
    { id: 'pdf', label: 'PDF (.pdf)' },
    { id: 'xlsx', label: 'Excel (.xlsx)' },
    { id: 'csv', label: 'CSV (.csv)' },
    { id: 'md', label: 'Markdown (.md)' },
    { id: 'txt', label: 'Text (.txt)' },
];

function FileChip({ file }) {
    return (
        <a
            href={route('files.show', { file: file.id, download: 1 })}
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
            <FileText className="h-4 w-4 shrink-0 text-gray-500" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-gray-400">{formatBytes(file.size)}</span>
        </a>
    );
}

function Generated({ files }) {
    return (
        <div className="mt-3 flex flex-wrap gap-3">
            {files.map((f) =>
                f.mime?.startsWith('image/') ? (
                    <a key={f.id} href={route('files.show', f.id)} target="_blank" rel="noreferrer" className="block">
                        <img src={route('files.show', f.id)} alt={f.name} className="max-h-80 rounded-xl border border-gray-200 dark:border-zinc-700" loading="lazy" />
                    </a>
                ) : (
                    <FileChip key={f.id} file={f} />
                ),
            )}
        </div>
    );
}

function Sources({ sources }) {
    if (!sources?.length) return null;

    return (
        <div className="mt-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400">
                <Globe className="h-3.5 w-3.5" /> Quellen
            </div>
            <ol className="grid gap-1.5 sm:grid-cols-2">
                {sources.map((s, i) => {
                    let host = '';
                    try {
                        host = new URL(s.url).hostname.replace(/^www\./, '');
                    } catch (e) {
                        host = '';
                    }
                    return (
                        <li key={i}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="flex gap-2 rounded-lg border border-gray-200 p-2 text-xs hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 font-medium dark:bg-zinc-800">{i + 1}</span>
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">{s.title || host}</span>
                                    <span className="block truncate text-gray-500 dark:text-zinc-400">{host}</span>
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function ToolEvents({ events, live }) {
    if (!events?.length) return null;

    return (
        <div className="mb-2 flex flex-wrap gap-1.5">
            {events.map((e, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {e.status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wrench className="h-3 w-3" />}
                    {e.summary || e.tool || e.name}
                </span>
            ))}
        </div>
    );
}

function Reasoning({ text }) {
    if (!text) return null;

    return (
        <details className="group mb-2 rounded-lg border border-gray-200 text-sm dark:border-zinc-700">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-zinc-400">
                <ChevronRight className="h-3.5 w-3.5 transition group-open:rotate-90" /> Gedankengang
            </summary>
            <div className="whitespace-pre-wrap border-t border-gray-200 px-3 py-2 text-xs text-gray-600 dark:border-zinc-700 dark:text-zinc-400">{text}</div>
        </details>
    );
}

function UserMessage({ message, editable, onEdit, disabled }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(message.content);

    return (
        <div className="flex justify-end">
            <div className="group max-w-[88%] sm:max-w-[75%]">
                {message.files?.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap justify-end gap-1.5">
                        {message.files.map((f) => (f.kind === 'image' ? (
                            <img key={f.id} src={route('files.show', f.id)} alt={f.name} className="max-h-40 rounded-lg border border-gray-200 dark:border-zinc-700" />
                        ) : (
                            <FileChip key={f.id} file={f} />
                        )))}
                    </div>
                )}
                {editing ? (
                    <div className="space-y-2">
                        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} autoFocus aria-label="Nachricht bearbeiten" />
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setDraft(message.content); }}>Abbrechen</Button>
                            <Button size="sm" disabled={!draft.trim()} onClick={() => { setEditing(false); onEdit(message, draft.trim()); }}>Speichern & neu antworten</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-end justify-end gap-1">
                        {editable && !disabled && (
                            <IconButton label="Nachricht bearbeiten" onClick={() => setEditing(true)} className="opacity-0 focus:opacity-100 group-hover:opacity-100">
                                <Pencil className="h-3.5 w-3.5" />
                            </IconButton>
                        )}
                        {message.content && (
                            <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-[15px] leading-relaxed text-white">{message.content}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function AssistantMessage({ message, isLast, streaming, onRegenerate, onRate, features, voicePrefs, onNotice, canRegenerate }) {
    const tts = useTts(`m-${message.id}`, voicePrefs);
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);
    const live = message.status === 'streaming';
    const waiting = live && !message.content;
    const ttsReady = features?.tts?.configured;
    const docsReady = features?.documents?.configured && !String(message.id).startsWith('tmp');

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(message.content || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            // ignoriert
        }
    };

    const exportAs = async (format) => {
        setExporting(true);
        try {
            const file = await api.post(route('messages.export', message.id), { format });
            window.location.href = route('files.show', { file: file.id, download: 1 });
        } catch (e) {
            onNotice(errorMessage(e, 'Export fehlgeschlagen.'));
        } finally {
            setExporting(false);
        }
    };

    const orbState = message.tool_events?.some((t) => t.status === 'running') ? 'searching' : message.content ? 'composing' : 'working';

    return (
        <div className="flex gap-3">
            <BotAvatar state={live ? orbState : 'breathing'} paused={!live} />
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                    <span className="font-medium">{message.model || 'Assistent'}</span>
                    {message.status === 'stopped' && <span>· abgebrochen</span>}
                </div>

                <ToolEvents events={message.tool_events} />
                <Reasoning text={message.reasoning} />

                {waiting ? (
                    <div className="flex items-center gap-2 py-1 text-sm text-gray-500 dark:text-zinc-400" role="status">
                        <ThinkingOrb state={orbState} size={20} style={{ width: 20, height: 20 }} theme="auto" />
                        <span>{orbState === 'searching' ? 'Recherchiert…' : 'Denkt nach…'}</span>
                    </div>
                ) : (
                    message.content && <Markdown content={message.content} />
                )}

                {message.status === 'error' && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{message.error || 'Die Antwort konnte nicht erzeugt werden.'}</span>
                    </div>
                )}

                <Generated files={message.generated || []} />
                <Sources sources={message.sources} />

                {!live && (
                    <div className="mt-2 flex flex-wrap items-center gap-0.5">
                        <IconButton label={copied ? 'Kopiert' : 'Antwort kopieren'} onClick={copy}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </IconButton>
                        <IconButton
                            label={ttsReady ? (tts.status === 'idle' ? 'Vorlesen' : 'Wiedergabe stoppen') : `Vorlesen nicht verfügbar: ${features?.tts?.reason || 'nicht konfiguriert'}`}
                            disabled={!ttsReady || !message.content}
                            onClick={() => tts.speak(message.content, onNotice)}
                        >
                            {tts.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : tts.status === 'playing' ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </IconButton>
                        <IconButton label="Gute Antwort" onClick={() => onRate(message, message.rating === 'up' ? null : 'up')} className={cx(message.rating === 'up' && 'text-emerald-600 dark:text-emerald-400')}>
                            <ThumbsUp className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Schlechte Antwort" onClick={() => onRate(message, message.rating === 'down' ? null : 'down')} className={cx(message.rating === 'down' && 'text-red-600 dark:text-red-400')}>
                            <ThumbsDown className="h-4 w-4" />
                        </IconButton>
                        {isLast && canRegenerate && (
                            <IconButton label="Neu generieren" onClick={onRegenerate} disabled={streaming}>
                                <RefreshCw className="h-4 w-4" />
                            </IconButton>
                        )}
                        {message.content && (
                            <Menu as="div" className="relative">
                                <MenuButton as={IconButton} label={docsReady ? 'Als Dokument exportieren' : 'Dokumentenexport nicht verfügbar'} disabled={!docsReady || exporting}>
                                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                </MenuButton>
                                <MenuItems anchor="bottom start" className="z-50 mt-1 w-48 rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                                    {exportFormats.map((f) => (
                                        <MenuItem key={f.id}>
                                            <button type="button" onClick={() => exportAs(f.id)} className="block w-full rounded-lg px-3 py-1.5 text-left data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800">
                                                {f.label}
                                            </button>
                                        </MenuItem>
                                    ))}
                                </MenuItems>
                            </Menu>
                        )}
                        {message.tokens_out > 0 && <span className="ml-2 text-xs text-gray-400">{message.tokens_in + message.tokens_out} Tokens</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

function Message(props) {
    const { message } = props;

    return (
        <article className="animate-fade-in" aria-label={message.role === 'user' ? 'Ihre Nachricht' : 'Antwort des Assistenten'}>
            {message.role === 'user' ? (
                <UserMessage message={message} editable={props.editable} onEdit={props.onEdit} disabled={props.streaming} />
            ) : (
                <AssistantMessage {...props} />
            )}
        </article>
    );
}

export default memo(Message);
