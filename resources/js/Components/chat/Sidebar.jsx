import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { Archive, ArchiveRestore, ChevronDown, ChevronRight, Folder, FolderPlus, MoreHorizontal, Pencil, Plus, Search, Star, StarOff, Trash2, FolderKanban } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { IconButton, Input, Spinner, cx } from '@/Components/ui';
import { api } from '@/lib/api';

function ChatItem({ chat, active, folders, onUpdate, onDelete, onNavigate }) {
    const [renaming, setRenaming] = useState(false);
    const [title, setTitle] = useState(chat.title);

    const save = () => {
        setRenaming(false);
        if (title.trim() && title !== chat.title) onUpdate(chat.id, { title: title.trim() });
        else setTitle(chat.title);
    };

    return (
        <li className="group relative">
            {renaming ? (
                <Input value={title} autoFocus onChange={(e) => setTitle(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setRenaming(false); setTitle(chat.title); } }} className="!py-1" aria-label="Chat umbenennen" />
            ) : (
                <>
                    <Link
                        href={route('chat.show', chat.id)}
                        onClick={onNavigate}
                        className={cx('flex items-center gap-2 rounded-lg px-2.5 py-2 pr-9 text-sm transition', active ? 'bg-gray-200/70 font-medium dark:bg-zinc-800' : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70')}
                        aria-current={active ? 'page' : undefined}
                    >
                        {chat.is_favorite && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                        <span className="truncate">{chat.title}</span>
                    </Link>
                    <Menu as="div" className="absolute right-1 top-1/2 -translate-y-1/2">
                        <MenuButton className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 opacity-0 hover:bg-gray-200 focus:opacity-100 group-hover:opacity-100 data-[open]:opacity-100 dark:hover:bg-zinc-700" aria-label={`Optionen für ${chat.title}`}>
                            <MoreHorizontal className="h-4 w-4" />
                        </MenuButton>
                        <MenuItems anchor="bottom end" className="z-50 w-56 rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                            <MenuItem><button type="button" onClick={() => setRenaming(true)} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800"><Pencil className="h-4 w-4" /> Umbenennen</button></MenuItem>
                            <MenuItem><button type="button" onClick={() => onUpdate(chat.id, { is_favorite: !chat.is_favorite })} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800">{chat.is_favorite ? <><StarOff className="h-4 w-4" /> Favorit entfernen</> : <><Star className="h-4 w-4" /> Als Favorit</>}</button></MenuItem>
                            <MenuItem><button type="button" onClick={() => onUpdate(chat.id, { archived: !chat.archived })} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800">{chat.archived ? <><ArchiveRestore className="h-4 w-4" /> Wiederherstellen</> : <><Archive className="h-4 w-4" /> Archivieren</>}</button></MenuItem>
                            {folders.length > 0 && <div className="my-1 border-t border-gray-100 px-3 pt-1.5 text-xs text-gray-400 dark:border-zinc-800">In Ordner verschieben</div>}
                            {chat.folder_id && <MenuItem><button type="button" onClick={() => onUpdate(chat.id, { folder_id: null })} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800">Aus Ordner entfernen</button></MenuItem>}
                            {folders.filter((f) => f.id !== chat.folder_id).map((f) => (
                                <MenuItem key={f.id}><button type="button" onClick={() => onUpdate(chat.id, { folder_id: f.id })} className="flex w-full items-center gap-2 truncate rounded-lg px-3 py-1.5 data-[focus]:bg-gray-100 dark:data-[focus]:bg-zinc-800"><Folder className="h-4 w-4 shrink-0" /><span className="truncate">{f.name}</span></button></MenuItem>
                            ))}
                            <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />
                            <MenuItem><button type="button" onClick={() => onDelete(chat)} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-red-600 data-[focus]:bg-red-50 dark:data-[focus]:bg-red-900/20"><Trash2 className="h-4 w-4" /> Löschen</button></MenuItem>
                        </MenuItems>
                    </Menu>
                </>
            )}
        </li>
    );
}

function Section({ title, count, defaultOpen = true, actions, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className="mb-3">
            <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400" aria-expanded={open}>
                    {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    {title}
                    {count != null && <span className="font-normal normal-case text-gray-400">({count})</span>}
                </button>
                {actions}
            </div>
            {open && children}
        </section>
    );
}

export default function Sidebar({ chats, folders, projects, activeChatId, onChatsChange, onFoldersChange, onNavigate, onNewChat }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [newFolder, setNewFolder] = useState(false);
    const [folderName, setFolderName] = useState('');

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults(null);
            return undefined;
        }
        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                setResults(await api.get(route('chats.search', { q: query.trim() })));
            } catch (e) {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const update = async (id, patch) => {
        onChatsChange((list) => list.map((c) => (c.id === id ? { ...c, ...patch, archived: patch.archived ?? c.archived } : c)));
        try {
            await api.patch(route('chats.update', id), patch);
        } catch (e) {
            // Beim nächsten Laden wird der Serverzustand angezeigt
        }
    };

    const remove = async (chat) => {
        if (!window.confirm(`Chat „${chat.title}“ endgültig löschen?`)) return;
        await api.delete(route('chats.destroy', chat.id));
        onChatsChange((list) => list.filter((c) => c.id !== chat.id));
        if (chat.id === activeChatId) onNewChat();
    };

    const createFolder = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return;
        const folder = await api.post(route('folders.store'), { name: folderName.trim() });
        onFoldersChange((list) => [...list, folder]);
        setFolderName('');
        setNewFolder(false);
    };

    const renameFolder = async (folder) => {
        const name = window.prompt('Neuer Ordnername', folder.name);
        if (!name?.trim()) return;
        await api.patch(route('folders.update', folder.id), { name: name.trim() });
        onFoldersChange((list) => list.map((f) => (f.id === folder.id ? { ...f, name: name.trim() } : f)));
    };

    const removeFolder = async (folder) => {
        if (!window.confirm(`Ordner „${folder.name}“ löschen? Die Chats bleiben erhalten.`)) return;
        await api.delete(route('folders.destroy', folder.id));
        onFoldersChange((list) => list.filter((f) => f.id !== folder.id));
        onChatsChange((list) => list.map((c) => (c.folder_id === folder.id ? { ...c, folder_id: null } : c)));
    };

    const groups = useMemo(() => {
        const active = chats.filter((c) => !c.archived);
        return {
            favorites: active.filter((c) => c.is_favorite),
            byFolder: folders.map((f) => ({ folder: f, chats: active.filter((c) => c.folder_id === f.id) })),
            loose: active.filter((c) => !c.folder_id),
            archived: chats.filter((c) => c.archived),
        };
    }, [chats, folders]);

    const item = (chat) => <ChatItem key={chat.id} chat={chat} active={chat.id === activeChatId} folders={folders} onUpdate={update} onDelete={remove} onNavigate={onNavigate} />;

    return (
        <div className="flex h-full flex-col">
            <div className="space-y-2 p-3">
                <button type="button" onClick={onNewChat} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700">
                    <Plus className="h-4 w-4" /> Neuer Chat
                </button>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chats durchsuchen…" aria-label="Chats durchsuchen" className="!pl-9" />
                    {searching && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                </div>
            </div>

            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {results ? (
                    <ul className="space-y-0.5">
                        {results.length === 0 && <li className="px-2 py-3 text-sm text-gray-500">Keine Treffer.</li>}
                        {results.map((r) => (
                            <li key={r.id}>
                                <Link href={route('chat.show', r.id)} onClick={onNavigate} className="block rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
                                    <span className="block truncate font-medium">{r.title}{r.archived && ' (Archiv)'}</span>
                                    {r.snippet && <span className="mt-0.5 block line-clamp-2 text-xs text-gray-500 dark:text-zinc-400">{r.snippet}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        {groups.favorites.length > 0 && <Section title="Favoriten" count={groups.favorites.length}><ul className="space-y-0.5">{groups.favorites.map(item)}</ul></Section>}

                        <Section title="Ordner" actions={<IconButton label="Ordner anlegen" onClick={() => setNewFolder(true)} className="!h-6 !w-6"><FolderPlus className="h-3.5 w-3.5" /></IconButton>}>
                            {newFolder && (
                                <form onSubmit={createFolder} className="mb-2 flex gap-1">
                                    <Input value={folderName} autoFocus onChange={(e) => setFolderName(e.target.value)} placeholder="Ordnername" aria-label="Ordnername" className="!py-1" onKeyDown={(e) => e.key === 'Escape' && setNewFolder(false)} />
                                </form>
                            )}
                            {groups.byFolder.length === 0 && !newFolder && <p className="px-2 py-1 text-xs text-gray-400">Noch keine Ordner.</p>}
                            {groups.byFolder.map(({ folder, chats: list }) => (
                                <Section key={folder.id} title={folder.name} count={list.length} defaultOpen={false} actions={
                                    <span className="flex">
                                        <IconButton label="Neuer Chat im Ordner" onClick={() => onNewChat({ folder: folder.id })} className="!h-6 !w-6"><Plus className="h-3.5 w-3.5" /></IconButton>
                                        <IconButton label="Ordner umbenennen" onClick={() => renameFolder(folder)} className="!h-6 !w-6"><Pencil className="h-3.5 w-3.5" /></IconButton>
                                        <IconButton label="Ordner löschen" onClick={() => removeFolder(folder)} className="!h-6 !w-6"><Trash2 className="h-3.5 w-3.5" /></IconButton>
                                    </span>
                                }>
                                    <ul className="space-y-0.5">{list.map(item)}</ul>
                                </Section>
                            ))}
                        </Section>

                        <Section title="Projekte" count={projects.length} defaultOpen={false}>
                            <ul className="space-y-0.5">
                                {projects.map((p) => (
                                    <li key={p.id}><Link href={route('projects.show', p.id)} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"><FolderKanban className="h-4 w-4 shrink-0" /><span className="truncate">{p.name}</span></Link></li>
                                ))}
                                <li><Link href={route('projects.index')} className="block px-2.5 py-1.5 text-xs text-brand-600 hover:underline dark:text-brand-300">Alle Projekte verwalten →</Link></li>
                            </ul>
                        </Section>

                        <Section title="Verlauf" count={groups.loose.length}>
                            <ul className="space-y-0.5">
                                {groups.loose.length === 0 && <li className="px-2 py-2 text-sm text-gray-400">Noch keine Chats.</li>}
                                {groups.loose.map(item)}
                            </ul>
                        </Section>

                        {groups.archived.length > 0 && <Section title="Archiv" count={groups.archived.length} defaultOpen={false}><ul className="space-y-0.5">{groups.archived.map(item)}</ul></Section>}
                    </>
                )}
            </div>
        </div>
    );
}
