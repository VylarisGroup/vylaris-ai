import { BorderBeam } from 'border-beam';
import { ArrowUp, Bot, Globe, Image as ImageIcon, Loader2, Mic, Paperclip, Square, X, FileText, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import VoiceGlow from '@/Components/chat/VoiceGlow';
import { IconButton, Select, cx } from '@/Components/ui';
import { useRecorder } from '@/hooks/useVoice';
import { api, errorMessage, formatBytes } from '@/lib/api';

const ACCEPT = '.pdf,.docx,.xlsx,.csv,.txt,.md,image/png,image/jpeg,image/webp,image/gif';

function FeatureButton({ feature, icon: Icon, label, active, onClick, children }) {
    const available = feature?.configured;
    const title = available ? label : `${label} nicht verfügbar: ${feature?.reason || 'nicht konfiguriert'}`;

    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active}
            disabled={!available}
            onClick={onClick}
            className={cx(
                'inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
                active ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' : 'text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
            )}
        >
            <Icon className="h-4 w-4" />
            {children}
        </button>
    );
}

export default function Composer({ features, agents, streaming, onSend, onStop, onNotice, sttLanguage, projectId, disabledReason }) {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [webSearch, setWebSearch] = useState(false);
    const [imageMode, setImageMode] = useState(false);
    const [agentId, setAgentId] = useState('');
    const [transcriptNote, setTranscriptNote] = useState(false);
    const [dragging, setDragging] = useState(false);
    const textarea = useRef(null);
    const fileInput = useRef(null);

    const recorder = useRecorder({
        language: sttLanguage,
        onTranscript: (value) => {
            if (!value) {
                onNotice('Es wurde keine Sprache erkannt.');
                return;
            }
            setText((prev) => (prev ? `${prev.trimEnd()} ${value}` : value));
            setTranscriptNote(true);
            setTimeout(() => textarea.current?.focus(), 50);
        },
        onError: onNotice,
    });

    useEffect(() => {
        const el = textarea.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
    }, [text]);

    // Verarbeitungsstatus hochgeladener Dateien abfragen
    useEffect(() => {
        const pending = attachments.filter((a) => a.id && ['pending', 'processing'].includes(a.status));
        if (!pending.length) return undefined;

        const timer = setInterval(async () => {
            try {
                const data = await api.get(route('files.status', { ids: pending.map((p) => p.id).join(',') }));
                setAttachments((prev) => prev.map((a) => data.find((d) => d.id === a.id) ? { ...a, ...data.find((d) => d.id === a.id) } : a));
            } catch (e) {
                // nächster Versuch
            }
        }, 1500);

        return () => clearInterval(timer);
    }, [attachments]);

    const upload = useCallback(
        async (fileList) => {
            const files = Array.from(fileList || []);
            if (!files.length) return;

            const temps = files.map((f, i) => ({ tempId: `${Date.now()}-${i}`, name: f.name, size: f.size, status: 'uploading', progress: 0 }));
            setAttachments((prev) => [...prev, ...temps]);

            const form = new FormData();
            files.forEach((f) => form.append('files[]', f));
            if (projectId) form.append('project_id', projectId);

            try {
                const data = await api.post(route('files.store'), form, {
                    onUploadProgress: (e) => {
                        const progress = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
                        setAttachments((prev) => prev.map((a) => (temps.some((t) => t.tempId === a.tempId) ? { ...a, progress } : a)));
                    },
                });
                setAttachments((prev) => [...prev.filter((a) => !temps.some((t) => t.tempId === a.tempId)), ...data.files.map((f) => ({ ...f, tempId: `f-${f.id}` }))]);
                data.errors?.forEach((e) => onNotice(e));
            } catch (e) {
                setAttachments((prev) => prev.filter((a) => !temps.some((t) => t.tempId === a.tempId)));
                const errors = e?.response?.data?.errors;
                if (Array.isArray(errors)) errors.forEach((x) => onNotice(x));
                else onNotice(errorMessage(e, 'Upload fehlgeschlagen.'));
            }
        },
        [onNotice, projectId],
    );

    const removeAttachment = async (a) => {
        setAttachments((prev) => prev.filter((x) => x.tempId !== a.tempId));
        if (a.id) {
            try {
                await api.delete(route('files.destroy', a.id));
            } catch (e) {
                // Datei bleibt ggf. bestehen
            }
        }
    };

    const busyUploads = attachments.some((a) => ['uploading', 'pending', 'processing'].includes(a.status));
    const canSend = !streaming && !busyUploads && !disabledReason && (text.trim() || attachments.some((a) => a.status === 'ready'));

    const submit = () => {
        if (!canSend) return;
        const ready = attachments.filter((a) => a.status === 'ready' || a.status === 'failed' ? a.status === 'ready' : false);
        onSend({ content: text.trim(), files: ready, webSearch, imageMode, agentId: agentId || null });
        setText('');
        setAttachments([]);
        setTranscriptNote(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
        }
    };

    const onPaste = (e) => {
        const files = Array.from(e.clipboardData?.files || []);
        if (files.length) {
            e.preventDefault();
            upload(files);
        }
    };

    const recording = recorder.state === 'recording';
    const transcribing = recorder.state === 'transcribing';
    const filesEnabled = features?.files?.configured;
    const agentsEnabled = features?.agents?.configured && agents?.length > 0;

    return (
        <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4">
            {transcriptNote && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-900/20 dark:text-amber-100" role="status">
                    <span>Transkription eingefügt – bitte prüfen und bei Bedarf korrigieren, bevor Sie senden.</span>
                    <button type="button" aria-label="Hinweis schliessen" onClick={() => setTranscriptNote(false)}><X className="h-3.5 w-3.5" /></button>
                </div>
            )}

            <BorderBeam size="md" colorVariant="colorful" theme="auto" active={streaming || recording} strength={0.9}>
                <div
                    className={cx('rounded-2xl border bg-white shadow-sm dark:bg-zinc-900', dragging ? 'border-brand-500 ring-2 ring-brand-300' : 'border-gray-200 dark:border-zinc-700')}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); if (filesEnabled) upload(e.dataTransfer.files); }}
                >
                    {attachments.length > 0 && (
                        <ul className="flex flex-wrap gap-2 px-3 pt-3" aria-label="Anhänge">
                            {attachments.map((a) => (
                                <li key={a.tempId} className={cx('flex max-w-[16rem] items-center gap-2 rounded-lg border px-2 py-1.5 text-xs', a.status === 'failed' ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800')}>
                                    {a.status === 'failed' ? <AlertCircle className="h-4 w-4 shrink-0 text-red-600" /> : ['uploading', 'pending', 'processing'].includes(a.status) ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : a.kind === 'image' ? <ImageIcon className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium">{a.name}</span>
                                        <span className="block truncate text-gray-500 dark:text-zinc-400">
                                            {a.status === 'uploading' ? `Hochladen… ${a.progress}%` : a.status === 'failed' ? a.status_message || 'Fehlgeschlagen' : a.status === 'ready' ? formatBytes(a.size) : 'Wird verarbeitet…'}
                                        </span>
                                    </span>
                                    <button type="button" aria-label={`${a.name} entfernen`} onClick={() => removeAttachment(a)} className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"><X className="h-3.5 w-3.5" /></button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {recording || transcribing ? (
                        <div className="flex items-center gap-3 px-4 py-4" role="status">
                            {transcribing ? <ThinkingOrb state="working" size={20} style={{ width: 20, height: 20 }} theme="auto" /> : <VoiceGlow level={recorder.level} active />}
                            <div className="flex-1 text-sm">
                                {transcribing ? 'Transkribiere…' : <>Aufnahme läuft · {String(Math.floor(recorder.seconds / 60)).padStart(2, '0')}:{String(recorder.seconds % 60).padStart(2, '0')}</>}
                            </div>
                            {recording && (
                                <>
                                    <button type="button" onClick={recorder.cancel} className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Verwerfen</button>
                                    <button type="button" onClick={recorder.stop} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"><Square className="h-3.5 w-3.5" /> Fertig</button>
                                </>
                            )}
                        </div>
                    ) : (
                        <textarea
                            ref={textarea}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={onKeyDown}
                            onPaste={onPaste}
                            rows={1}
                            placeholder={disabledReason || (imageMode ? 'Beschreiben Sie das gewünschte Bild…' : 'Nachricht an den Assistenten… (Umschalt+Enter für neue Zeile)')}
                            aria-label="Nachricht"
                            disabled={!!disabledReason}
                            className="block max-h-60 w-full resize-none border-0 bg-transparent px-4 pt-3 pb-1 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                    )}

                    <div className="flex items-center gap-1 px-2 pb-2 pt-1">
                        <input ref={fileInput} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
                        <FeatureButton feature={features?.files} icon={Paperclip} label="Dateien anhängen" onClick={() => fileInput.current?.click()} />
                        <FeatureButton feature={features?.web_search} icon={Globe} label="Websuche" active={webSearch} onClick={() => setWebSearch((v) => !v)}>
                            {webSearch && 'Web'}
                        </FeatureButton>
                        <FeatureButton feature={features?.image_generation} icon={ImageIcon} label="Bild generieren" active={imageMode} onClick={() => setImageMode((v) => !v)}>
                            {imageMode && 'Bild'}
                        </FeatureButton>
                        {agentsEnabled && (
                            <span className="flex items-center gap-1">
                                <Bot className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                <Select value={agentId} onChange={(e) => setAgentId(e.target.value)} aria-label="Agent wählen" className="!w-auto !py-1 !text-xs">
                                    <option value="">Kein Agent</option>
                                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Select>
                            </span>
                        )}
                        <span className="flex-1" />
                        <FeatureButton feature={features?.stt} icon={Mic} label="Spracheingabe" active={recording} onClick={recording ? recorder.stop : recorder.start} />
                        {streaming ? (
                            <button type="button" onClick={onStop} aria-label="Antwort stoppen" title="Antwort stoppen" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 dark:bg-zinc-100 dark:text-zinc-900">
                                <Square className="h-4 w-4" />
                            </button>
                        ) : (
                            <button type="button" onClick={submit} disabled={!canSend} aria-label="Senden" title="Senden (Enter)" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500">
                                <ArrowUp className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </BorderBeam>
            <p className="mt-2 text-center text-xs text-gray-400 dark:text-zinc-500">KI-Antworten können Fehler enthalten. Wichtige Informationen bitte prüfen.</p>
        </div>
    );
}
