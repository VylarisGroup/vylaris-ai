import { Head, Link, router, usePage } from '@inertiajs/react';
import { FolderKanban, LogOut, Menu as MenuIcon, PanelLeftClose, Settings as SettingsIcon, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BotAvatar from '@/Components/chat/BotAvatar';
import Composer from '@/Components/chat/Composer';
import Message from '@/Components/chat/Message';
import Sidebar from '@/Components/chat/Sidebar';
import ThemeToggle from '@/Components/ThemeToggle';
import { Alert, IconButton, Select, cx } from '@/Components/ui';
import { useThemeSync } from '@/Layouts/AppLayout';
import { api, errorMessage, streamPost } from '@/lib/api';

const PARAM_META = {
    temperature: { label: 'Temperatur', min: 0, max: 2, step: 0.1 },
    top_p: { label: 'Top-P', min: 0, max: 1, step: 0.05 },
    max_tokens: { label: 'Max. Tokens', min: 64, max: 32000, step: 64 },
    presence_penalty: { label: 'Presence-Penalty', min: -2, max: 2, step: 0.1 },
    frequency_penalty: { label: 'Frequency-Penalty', min: -2, max: 2, step: 0.1 },
};

function ParametersPanel({ model, values, onChange, instructions, onInstructions }) {
    const allowed = (model?.allowed_parameters || []).filter((p) => PARAM_META[p]);

    return (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
                <label htmlFor="chat-instructions" className="mb-1 block font-medium">Anweisungen für diesen Chat</label>
                <textarea id="chat-instructions" value={instructions} onChange={(e) => onInstructions(e.target.value)} rows={3} maxLength={5000} placeholder="z. B. Antworte immer kurz und auf Deutsch." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
            </div>
            {!model && <p className="text-gray-500">Bei „Auto“ werden die Modellparameter automatisch gewählt. Wähle ein Modell, um sie anzupassen.</p>}
            {model && allowed.length === 0 && <p className="text-gray-500">Dieses Modell erlaubt keine einstellbaren Parameter.</p>}
            {allowed.map((key) => {
                const meta = PARAM_META[key];
                const value = values[key] ?? model.defaults?.[key] ?? '';
                return (
                    <div key={key}>
                        <div className="flex items-center justify-between">
                            <label htmlFor={`param-${key}`} className="font-medium">{meta.label}</label>
                            <span className="tabular-nums text-gray-500">{value === '' ? 'Standard' : value}</span>
                        </div>
                        <input id={`param-${key}`} type="range" min={meta.min} max={meta.max} step={meta.step} value={value === '' ? meta.min : value} onChange={(e) => onChange({ ...values, [key]: Number(e.target.value) })} className="w-full accent-brand-600" />
                    </div>
                );
            })}
            {Object.keys(values).length > 0 && <button type="button" onClick={() => onChange({})} className="text-xs text-brand-600 hover:underline dark:text-brand-300">Auf Modellstandard zurücksetzen</button>}
        </div>
    );
}

function Welcome({ name, onPick, disabled }) {
    const ideas = ['Fasse mir die wichtigsten Punkte eines Textes zusammen', 'Erkläre mir ein Konzept Schritt für Schritt', 'Hilf mir, eine E-Mail zu formulieren', 'Schreibe eine Python-Funktion mit Beispiel'];

    return (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
            <BotAvatar size={64} />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Wie kann ich helfen{name ? `, ${name.split(' ')[0]}` : ''}?</h2>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {ideas.map((idea) => (
                    <button key={idea} type="button" disabled={disabled} onClick={() => onPick(idea)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-700 dark:hover:bg-zinc-800">
                        {idea}
                    </button>
                ))}
            </div>
        </div>
    );
}

const blankAssistant = (extra) => ({ role: 'assistant', content: '', reasoning: '', sources: [], tool_events: [], generated: [], files: [], rating: null, ...extra });

export default function ChatIndex({ chat: initialChat, messages: initialMessages, sidebar, models, agents, voice, newChat }) {
    const { auth, features, app } = usePage().props;
    useThemeSync();

    const [chat, setChat] = useState(initialChat);
    const [messages, setMessages] = useState(initialMessages);
    const [chats, setChats] = useState(sidebar.chats);
    const [folders, setFolders] = useState(sidebar.folders);
    const [streaming, setStreaming] = useState(false);
    const [notice, setNotice] = useState(null);
    const [modelId, setModelId] = useState(initialChat?.ai_model_id ?? '');
    const [params, setParams] = useState(initialChat?.parameters && !Array.isArray(initialChat.parameters) ? { ...initialChat.parameters } : {});
    const [instructions, setInstructions] = useState(initialChat?.instructions ?? '');
    const [showParams, setShowParams] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(false);

    const abortRef = useRef(null);
    const scrollRef = useRef(null);
    const stickRef = useRef(true);
    const lastOptionsRef = useRef({});
    const chatRef = useRef(initialChat);

    const prefs = auth.user.preferences || {};
    const voicePrefs = prefs.voice || {};
    const selectedModel = models.find((m) => String(m.id) === String(modelId)) || null;

    useEffect(() => {
        chatRef.current = chat;
    }, [chat]);

    useEffect(() => {
        setChat(initialChat);
        setMessages(initialMessages);
        setModelId(initialChat?.ai_model_id ?? '');
        setParams(initialChat?.parameters && !Array.isArray(initialChat.parameters) ? { ...initialChat.parameters } : {});
        setInstructions(initialChat?.instructions ?? '');
        setNotice(null);
        stickRef.current = true;
    }, [initialChat?.id]);

    useEffect(() => setChats(sidebar.chats), [sidebar.chats]);
    useEffect(() => setFolders(sidebar.folders), [sidebar.folders]);
    useEffect(() => () => abortRef.current?.abort(), []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el && stickRef.current) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    const onScroll = () => {
        const el = scrollRef.current;
        if (el) {
            stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }
    };

    const patchLast = useCallback((fn) => {
        setMessages((list) => {
            if (!list.length) return list;
            const copy = list.slice();
            copy[copy.length - 1] = fn(copy[copy.length - 1]);
            return copy;
        });
    }, []);

    const appendError = useCallback((text) => {
        setMessages((list) => {
            const last = list[list.length - 1];
            if (last?.role === 'assistant' && last.status === 'streaming') {
                return list.map((m, i) => (i === list.length - 1 ? { ...m, status: 'error', error: text } : m));
            }
            return [...list, blankAssistant({ id: `err-${Date.now()}`, status: 'error', error: text })];
        });
    }, []);

    const handleEvent = useCallback((event, ctx) => {
        switch (event.type) {
            case 'open':
                ctx.chatId = event.chat.id;
                if (event.chat.is_new) {
                    setChat({ id: event.chat.id, title: event.chat.title, is_favorite: false, archived: false, folder_id: newChat?.folder_id ?? null, project_id: newChat?.project_id ?? null, project: null });
                    setChats((list) => [{ id: event.chat.id, title: event.chat.title, is_favorite: false, archived: false, folder_id: newChat?.folder_id ?? null, project_id: newChat?.project_id ?? null }, ...list]);
                    window.history.replaceState(window.history.state, '', route('chat.show', event.chat.id));
                }
                if (event.user_message_id && ctx.tempUserId) {
                    setMessages((list) => list.map((m) => (m.id === ctx.tempUserId ? { ...m, id: event.user_message_id } : m)));
                }
                break;
            case 'meta':
                setMessages((list) => [...list, blankAssistant({ id: event.message_id, status: 'streaming', model: event.model?.name })]);
                break;
            case 'delta':
                patchLast((m) => ({ ...m, content: (m.content || '') + event.text }));
                break;
            case 'reasoning':
                patchLast((m) => ({ ...m, reasoning: (m.reasoning || '') + event.text }));
                break;
            case 'sources':
                patchLast((m) => ({ ...m, sources: event.sources }));
                break;
            case 'tool':
                patchLast((m) => {
                    const events = (m.tool_events || []).filter((t) => !(t.name === event.name && t.status === 'running'));
                    return { ...m, tool_events: [...events, { name: event.name, status: event.status, summary: event.summary }] };
                });
                break;
            case 'generated':
                patchLast((m) => ({ ...m, generated: [...(m.generated || []), ...event.files] }));
                break;
            case 'notice':
                setNotice(event.message);
                break;
            case 'error':
                appendError(event.message);
                break;
            case 'done':
                patchLast((m) => (m.status === 'error' ? m : { ...m, status: event.status === 'stopped' ? 'stopped' : 'done', tokens_in: event.tokens_in, tokens_out: event.tokens_out }));
                break;
            case 'end':
                if (event.title) {
                    setChat((c) => (c ? { ...c, title: event.title } : c));
                    setChats((list) => list.map((c) => (c.id === ctx.chatId ? { ...c, title: event.title } : c)));
                }
                break;
            default:
                break;
        }
    }, [newChat, patchLast, appendError]);

    const refreshTitleLater = useCallback((chatId) => {
        [4000, 10000].forEach((delay) => setTimeout(async () => {
            try {
                const { title } = await api.get(route('chats.title', chatId));
                setChats((list) => list.map((c) => (c.id === chatId ? { ...c, title } : c)));
                setChat((c) => (c && c.id === chatId ? { ...c, title } : c));
            } catch (e) {
                // ignoriert
            }
        }, delay));
    }, []);

    const run = useCallback(async (url, body, ctx = {}) => {
        const controller = new AbortController();
        abortRef.current = controller;
        setStreaming(true);
        setNotice(null);
        stickRef.current = true;
        ctx.chatId = ctx.chatId ?? chatRef.current?.id;

        try {
            await streamPost(url, body, (event) => handleEvent(event, ctx), { signal: controller.signal });
        } catch (e) {
            if (e.name !== 'AbortError') {
                appendError(e.message || errorMessage(e, 'Verbindung unterbrochen.'));
            }
        } finally {
            setStreaming(false);
            abortRef.current = null;
            setMessages((list) => list.map((m) => (m.status === 'streaming' ? { ...m, status: 'stopped' } : m)));
            if (ctx.chatId) {
                refreshTitleLater(ctx.chatId);
            }
        }
    }, [handleEvent, appendError, refreshTitleLater]);

    const buildOptions = (extra = {}) => ({
        model_id: modelId === '' ? null : Number(modelId),
        parameters: Object.keys(params).length ? params : undefined,
        ...extra,
    });

    const send = useCallback(async ({ content, files, webSearch, imageMode, agentId }) => {
        const tempUserId = `tmp-${Date.now()}`;
        setMessages((list) => [...list, { id: tempUserId, role: 'user', content, files: files || [], sources: [], generated: [], tool_events: [], status: 'done' }]);
        lastOptionsRef.current = { web_search: !!webSearch, image_mode: !!imageMode, agent_id: agentId || null };

        if (chat && instructions !== (chat.instructions ?? '')) {
            api.patch(route('chats.update', chat.id), { instructions }).catch(() => {});
        }

        await run(route('chat.stream'), buildOptions({
            content,
            chat_id: chat?.id ?? null,
            project_id: chat?.project_id ?? newChat?.project_id ?? null,
            folder_id: chat?.folder_id ?? newChat?.folder_id ?? null,
            file_ids: (files || []).map((f) => f.id),
            ...lastOptionsRef.current,
        }), { tempUserId });
    }, [chat, instructions, modelId, params, newChat, run]);

    const regenerate = () => {
        if (!chat || streaming) return;
        setMessages((list) => (list.length && list[list.length - 1].role === 'assistant' ? list.slice(0, -1) : list));
        run(route('chats.regenerate', chat.id), buildOptions(lastOptionsRef.current), { chatId: chat.id });
    };

    const edit = (message, content) => {
        if (!chat || streaming) return;
        setMessages((list) => {
            const index = list.findIndex((m) => m.id === message.id);
            return list.slice(0, index + 1).map((m) => (m.id === message.id ? { ...m, content } : m));
        });
        run(route('messages.edit', message.id), buildOptions({ ...lastOptionsRef.current, content }), { chatId: chat.id });
    };

    const rate = async (message, rating) => {
        setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, rating } : m)));
        try {
            await api.post(route('messages.rate', message.id), { rating });
        } catch (e) {
            setNotice(errorMessage(e, 'Bewertung konnte nicht gespeichert werden.'));
        }
    };

    const stop = () => abortRef.current?.abort();

    const newChatAction = (opts = {}) => {
        if (streaming) stop();
        setSidebarOpen(false);
        router.visit(route('chat.index', opts.folder ? { folder: opts.folder } : {}));
    };

    const lastAssistantIndex = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'assistant') return i;
        }
        return -1;
    }, [messages]);

    const lastUserIndex = useMemo(() => messages.map((m) => m.role).lastIndexOf('user'), [messages]);

    const noModels = models.length === 0;
    const disabledReason = noModels ? 'Es ist noch kein Chat-Modell konfiguriert. Ein Administrator muss unter „Admin → Anbieter“ einen Anbieter und ein Modell einrichten.' : null;
    const iconLink = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:text-zinc-400 dark:hover:bg-zinc-800';

    return (
        <div className="flex h-dvh bg-white dark:bg-zinc-950">
            <Head title={chat?.title || 'Neuer Chat'} />

            {sidebarOpen && <button type="button" aria-label="Seitenleiste schließen" className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

            <aside className={cx('fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-gray-50 transition-transform dark:border-zinc-800 dark:bg-zinc-900 md:static md:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full', sidebarHidden && 'md:hidden')}>
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-3 dark:border-zinc-800">
                    <Link href={route('chat.index')} className="flex items-center gap-2 font-semibold">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">V</span>
                        {app.name}
                    </Link>
                    <IconButton label="Seitenleiste ausblenden" onClick={() => { setSidebarOpen(false); setSidebarHidden(true); }}><PanelLeftClose className="h-4 w-4" /></IconButton>
                </div>
                <div className="min-h-0 flex-1">
                    <Sidebar chats={chats} folders={folders} projects={sidebar.projects} activeChatId={chat?.id} onChatsChange={setChats} onFoldersChange={setFolders} onNavigate={() => setSidebarOpen(false)} onNewChat={newChatAction} />
                </div>
                <div className="flex shrink-0 items-center justify-between border-t border-gray-200 p-2 dark:border-zinc-800">
                    <div className="flex items-center gap-0.5">
                        <Link href={route('projects.index')} className={iconLink} aria-label="Projekte" title="Projekte"><FolderKanban className="h-4 w-4" /></Link>
                        <Link href={route('settings.edit')} className={iconLink} aria-label="Einstellungen" title="Einstellungen"><SettingsIcon className="h-4 w-4" /></Link>
                        {auth.user.is_admin && <Link href={route('admin.dashboard')} className={iconLink} aria-label="Administration" title="Administration"><ShieldCheck className="h-4 w-4" /></Link>}
                    </div>
                    <div className="flex items-center gap-0.5">
                        <ThemeToggle />
                        <Link href={route('logout')} method="post" as="button" className={iconLink} aria-label="Abmelden" title={`Abmelden (${auth.user.name})`}><LogOut className="h-4 w-4" /></Link>
                    </div>
                </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 px-3 dark:border-zinc-800">
                    <IconButton label="Seitenleiste öffnen" onClick={() => { setSidebarOpen(true); setSidebarHidden(false); }} className={cx(!sidebarHidden && 'md:hidden')}><MenuIcon className="h-5 w-5" /></IconButton>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-sm font-medium">{chat?.title || 'Neuer Chat'}</h1>
                        {chat?.project && <p className="truncate text-xs text-gray-500">Projekt: {chat.project.name}</p>}
                    </div>
                    <label className="sr-only" htmlFor="model-select">Modell</label>
                    <Select id="model-select" value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={streaming || noModels} className="!w-auto max-w-[11rem] sm:max-w-xs">
                        <option value="">Auto (beste Wahl)</option>
                        {models.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.provider}</option>)}
                    </Select>
                    <IconButton label="Parameter und Anweisungen" onClick={() => setShowParams((v) => !v)} className={cx(showParams && 'bg-gray-100 dark:bg-zinc-800')}>{showParams ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}</IconButton>
                </header>

                {showParams && (
                    <div className="border-b border-gray-200 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="mx-auto max-w-3xl">
                            <ParametersPanel model={selectedModel} values={params} onChange={setParams} instructions={instructions} onInstructions={setInstructions} />
                        </div>
                    </div>
                )}

                <div ref={scrollRef} onScroll={onScroll} className="scroll-thin min-h-0 flex-1 overflow-y-auto" aria-busy={streaming}>
                    {messages.length === 0 ? (
                        <Welcome name={auth.user.name} disabled={noModels || streaming} onPick={(text) => send({ content: text, files: [], webSearch: false, imageMode: false, agentId: null })} />
                    ) : (
                        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6" role="log" aria-live="polite">
                            {messages.map((message, index) => (
                                <Message
                                    key={message.id}
                                    message={message}
                                    isLast={index === lastAssistantIndex}
                                    streaming={streaming}
                                    editable={!streaming && typeof message.id === 'number' && index === lastUserIndex}
                                    canRegenerate={!streaming}
                                    onEdit={edit}
                                    onRegenerate={regenerate}
                                    onRate={rate}
                                    features={features}
                                    voicePrefs={voicePrefs}
                                    onNotice={setNotice}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="shrink-0 px-3 pb-3 pt-2">
                    <div className="mx-auto max-w-3xl">
                        {notice && (
                            <div className="mb-2 flex items-start gap-2">
                                <div className="min-w-0 flex-1"><Alert type="warning">{notice}</Alert></div>
                                <IconButton label="Hinweis schliessen" onClick={() => setNotice(null)}><X className="h-4 w-4" /></IconButton>
                            </div>
                        )}
                        <Composer
                            features={features}
                            agents={agents}
                            streaming={streaming}
                            onSend={send}
                            onStop={stop}
                            onNotice={setNotice}
                            sttLanguage={prefs.stt_language || voice.languages?.[0] || 'de'}
                            projectId={chat?.project_id ?? newChat?.project_id ?? null}
                            disabledReason={disabledReason}
                        />
                        <p className="mt-2 text-center text-xs text-gray-400">KI-Antworten können Fehler enthalten. Wichtige Angaben bitte prüfen.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
