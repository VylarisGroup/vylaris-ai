import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronRight, Pencil, Plug, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Field, IconButton, Input, Modal, Select, Textarea, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { api, errorMessage } from '@/lib/api';

const TIERS = [['fast', 'Schnell'], ['balanced', 'Ausgewogen'], ['strong', 'Stark']];
const PARAMS = ['temperature', 'top_p', 'max_tokens', 'presence_penalty', 'frequency_penalty', 'reasoning_effort'];

function ProviderForm({ provider, onClose }) {
    const form = useForm({
        name: provider?.name || '', driver: provider?.driver || 'openai_compatible', template: provider?.template || '', base_url: provider?.base_url || '',
        api_key: '', api_version: provider?.api_version || '', timeout: provider?.timeout || 120, is_enabled: provider?.is_enabled ?? true, is_fallback: provider?.is_fallback ?? false,
        priority: provider?.priority ?? 100, notes: provider?.notes || '', extra_headers: {},
    });
    const [headers, setHeaders] = useState((provider?.extra_header_names || []).map((name) => ({ name, value: '' })));

    const submit = (e) => {
        e.preventDefault();
        form.transform((d) => {
            const extra = {};
            headers.forEach((h) => { if (h.name && h.value) extra[h.name] = h.value; });
            return { ...d, api_key: d.api_key || undefined, extra_headers: Object.keys(extra).length ? extra : undefined };
        });
        const opts = { preserveScroll: true, onSuccess: onClose };
        provider ? form.patch(route('admin.providers.update', provider.id), opts) : form.post(route('admin.providers.store'), opts);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={form.errors.name}><Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
                <Field label="Treiber" error={form.errors.driver}>
                    <Select value={form.data.driver} onChange={(e) => form.setData('driver', e.target.value)}><option value="openai_compatible">OpenAI-kompatibel</option><option value="azure_openai">Azure OpenAI</option></Select>
                </Field>
            </div>
            <Field label="Basis-URL" hint="Nur externe HTTPS-Endpunkte. Lokale oder private Adressen werden abgelehnt." error={form.errors.base_url}><Input value={form.data.base_url} onChange={(e) => form.setData('base_url', e.target.value)} placeholder="https://api.example.com/v1" required /></Field>
            <Field label="API-Schlüssel" hint={provider?.has_key ? 'Gespeichert (verschlüsselt). Leer lassen, um ihn beizubehalten.' : 'Wird verschlüsselt gespeichert und nie an den Browser zurückgegeben.'} error={form.errors.api_key}><Input type="password" autoComplete="off" value={form.data.api_key} onChange={(e) => form.setData('api_key', e.target.value)} /></Field>
            {form.data.driver === 'azure_openai' && <Field label="API-Version" error={form.errors.api_version}><Input value={form.data.api_version} onChange={(e) => form.setData('api_version', e.target.value)} placeholder="2024-10-21" /></Field>}
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Timeout (Sekunden)" error={form.errors.timeout}><Input type="number" min="5" max="600" value={form.data.timeout} onChange={(e) => form.setData('timeout', e.target.value)} /></Field>
                <Field label="Priorität (kleiner = zuerst)" error={form.errors.priority}><Input type="number" value={form.data.priority} onChange={(e) => form.setData('priority', e.target.value)} /></Field>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Zusätzliche Header</span><Button type="button" variant="ghost" size="sm" onClick={() => setHeaders([...headers, { name: '', value: '' }])}>+ Header</Button></div>
                {headers.map((h, i) => (
                    <div key={i} className="flex gap-2">
                        <Input aria-label="Header-Name" placeholder="Name" value={h.name} onChange={(e) => setHeaders(headers.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                        <Input aria-label="Header-Wert" type="password" placeholder={provider ? 'Neu setzen (leer = verwerfen)' : 'Wert'} value={h.value} onChange={(e) => setHeaders(headers.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                        <IconButton label="Entfernen" onClick={() => setHeaders(headers.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></IconButton>
                    </div>
                ))}
                {provider && headers.length > 0 && <p className="text-xs text-gray-500">Gesetzte Header-Werte bleiben verborgen; zum Ändern alle Werte neu eingeben.</p>}
            </div>
            <Field label="Notizen"><Textarea rows={2} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} /></Field>
            <Toggle checked={form.data.is_enabled} onChange={(v) => form.setData('is_enabled', v)} label="Aktiv" />
            <Toggle checked={form.data.is_fallback} onChange={(v) => form.setData('is_fallback', v)} label="Als Fallback verwenden" description="Bei Ausfall des gewählten Anbieters werden Fallback-Anbieter in Prioritätsreihenfolge versucht." />
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button><Button type="submit" loading={form.processing}>Speichern</Button></div>
        </form>
    );
}

function ModelForm({ provider, model, capabilities, onClose }) {
    const p = model?.parameters || {};
    const form = useForm({
        model_id: model?.model_id || '', display_name: model?.display_name || '', tier: model?.tier || 'balanced',
        parameters: { temperature: p.temperature ?? '', top_p: p.top_p ?? '', max_tokens: p.max_tokens ?? '', presence_penalty: p.presence_penalty ?? '', frequency_penalty: p.frequency_penalty ?? '', reasoning_effort: p.reasoning_effort ?? '', _stream_usage: p._stream_usage ?? true },
        allowed_parameters: model?.allowed_parameters || ['temperature', 'top_p', 'max_tokens'],
        context_window: model?.context_window ?? '', price_input: model?.price_input ?? '', price_output: model?.price_output ?? '', currency: model?.currency || 'USD',
        is_enabled: model?.is_enabled ?? true, is_default: model?.is_default ?? false, sort: model?.sort ?? 100,
        capabilities: (model?.capabilities || [{ capability: 'chat', config: {} }]).map((c) => ({ capability: c.capability, config: c.config || {} })),
    });
    const has = (c) => form.data.capabilities.some((x) => x.capability === c);
    const configOf = (c) => form.data.capabilities.find((x) => x.capability === c)?.config || {};
    const toggleCap = (c) => form.setData('capabilities', has(c) ? form.data.capabilities.filter((x) => x.capability !== c) : [...form.data.capabilities, { capability: c, config: {} }]);
    const setConfig = (c, key, value) => form.setData('capabilities', form.data.capabilities.map((x) => (x.capability === c ? { ...x, config: { ...x.config, [key]: value } } : x)));
    const setParam = (k, v) => form.setData('parameters', { ...form.data.parameters, [k]: v });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        model ? form.patch(route('admin.models.update', model.id), opts) : form.post(route('admin.models.store', provider.id), opts);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Modell-ID / Deployment" hint="Exakt wie beim Anbieter" error={form.errors.model_id}><Input value={form.data.model_id} onChange={(e) => form.setData('model_id', e.target.value)} required /></Field>
                <Field label="Anzeigename" error={form.errors.display_name}><Input value={form.data.display_name} onChange={(e) => form.setData('display_name', e.target.value)} required /></Field>
            </div>
            <div>
                <p className="mb-2 text-sm font-medium">Capabilities</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {capabilities.map((c) => (
                        <label key={c.value} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-zinc-700"><input type="checkbox" checked={has(c.value)} onChange={() => toggleCap(c.value)} className="rounded border-gray-300 text-brand-600" />{c.label}</label>
                    ))}
                </div>
                {form.errors.capabilities && <p className="mt-1 text-xs text-red-600">{form.errors.capabilities}</p>}
            </div>
            {has('image_generation') && <Field label="Bildgrössen (Komma-getrennt)" hint="z. B. 1024x1024,1792x1024"><Input defaultValue={(configOf('image_generation').sizes || []).join(',')} onBlur={(e) => setConfig('image_generation', 'sizes', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} /></Field>}
            {has('embeddings') && <Field label="Embedding-Dimensionen (optional)"><Input type="number" value={configOf('embeddings').dimensions ?? ''} onChange={(e) => setConfig('embeddings', 'dimensions', e.target.value ? Number(e.target.value) : null)} /></Field>}
            <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Stufe (Auto-Auswahl)"><Select value={form.data.tier} onChange={(e) => form.setData('tier', e.target.value)}>{TIERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
                <Field label="Kontextfenster"><Input type="number" value={form.data.context_window} onChange={(e) => form.setData('context_window', e.target.value)} /></Field>
                <Field label="Sortierung"><Input type="number" value={form.data.sort} onChange={(e) => form.setData('sort', e.target.value)} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Preis Eingabe / 1 Mio. Tokens"><Input type="number" step="0.0001" min="0" value={form.data.price_input} onChange={(e) => form.setData('price_input', e.target.value)} /></Field>
                <Field label="Preis Ausgabe / 1 Mio. Tokens"><Input type="number" step="0.0001" min="0" value={form.data.price_output} onChange={(e) => form.setData('price_output', e.target.value)} /></Field>
                <Field label="Währung"><Input maxLength={3} value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value.toUpperCase())} /></Field>
            </div>
            <details className="rounded-lg border border-gray-200 p-3 dark:border-zinc-700">
                <summary className="cursor-pointer text-sm font-medium">Standardparameter</summary>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    {['temperature', 'top_p', 'max_tokens', 'presence_penalty', 'frequency_penalty'].map((k) => <Field key={k} label={k} error={form.errors[`parameters.${k}`]}><Input type="number" step="any" value={form.data.parameters[k]} onChange={(e) => setParam(k, e.target.value)} /></Field>)}
                    <Field label="reasoning_effort"><Select value={form.data.parameters.reasoning_effort} onChange={(e) => setParam('reasoning_effort', e.target.value)}><option value="">–</option><option>low</option><option>medium</option><option>high</option></Select></Field>
                </div>
                <div className="mt-3"><Toggle checked={!!form.data.parameters._stream_usage} onChange={(v) => setParam('_stream_usage', v)} label="Token-Verbrauch im Stream anfordern" description="Bei Anbietern ohne stream_options deaktivieren." /></div>
                <p className="mt-3 text-sm font-medium">Für Benutzer einstellbar</p>
                <div className="mt-1 flex flex-wrap gap-3">{PARAMS.map((k) => <label key={k} className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={form.data.allowed_parameters.includes(k)} onChange={() => form.setData('allowed_parameters', form.data.allowed_parameters.includes(k) ? form.data.allowed_parameters.filter((x) => x !== k) : [...form.data.allowed_parameters, k])} className="rounded border-gray-300 text-brand-600" />{k}</label>)}</div>
            </details>
            <Toggle checked={form.data.is_enabled} onChange={(v) => form.setData('is_enabled', v)} label="Aktiv" />
            <Toggle checked={form.data.is_default} onChange={(v) => form.setData('is_default', v)} label="Standardmodell" description="Wird bei „Auto“ bevorzugt, wenn keine Komplexitätsregel greift." />
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button><Button type="submit" loading={form.processing}>Speichern</Button></div>
        </form>
    );
}

function ProviderCard({ provider, capabilities, onEdit, onModel }) {
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState({});
    const [discovered, setDiscovered] = useState(null);

    const test = async (model) => {
        setResults((r) => ({ ...r, [model.id]: { loading: true } }));
        try {
            const result = await api.post(route('admin.providers.test', provider.id), { model_id: model.id });
            setResults((r) => ({ ...r, [model.id]: result }));
        } catch (e) {
            setResults((r) => ({ ...r, [model.id]: { ok: false, message: errorMessage(e) } }));
        }
    };

    const discover = async () => {
        try {
            setDiscovered(await api.post(route('admin.providers.discover', provider.id)));
        } catch (e) {
            setDiscovered({ ok: false, message: errorMessage(e) });
        }
    };

    return (
        <Card>
            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={open}>
                    {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="truncate font-semibold">{provider.name}</span>
                    <Badge color={provider.is_enabled ? 'green' : 'gray'}>{provider.is_enabled ? 'Aktiv' : 'Inaktiv'}</Badge>
                    {provider.is_fallback && <Badge color="amber">Fallback</Badge>}
                    <Badge color={provider.has_key ? 'blue' : 'red'}>{provider.has_key ? 'Schlüssel gesetzt' : 'Kein Schlüssel'}</Badge>
                </button>
                <span className="hidden truncate text-xs text-gray-500 md:block">{provider.base_url}</span>
                <IconButton label="Provider bearbeiten" onClick={() => onEdit(provider)}><Pencil className="h-4 w-4" /></IconButton>
                <IconButton label="Provider löschen" onClick={() => window.confirm(`Provider „${provider.name}“ samt Modellen löschen?`) && router.delete(route('admin.providers.destroy', provider.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton>
            </div>
            {open && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => onModel(provider, null)}><Plus className="h-4 w-4" /> Modell</Button>
                        <Button size="sm" variant="secondary" onClick={discover}><Search className="h-4 w-4" /> Modelle beim Anbieter abrufen</Button>
                    </div>
                    {discovered && (discovered.ok ? (
                        <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-zinc-800/50"><p className="mb-1 font-medium">{discovered.models.length} Modelle verfügbar (zum Anlegen Modell-ID kopieren):</p><p className="max-h-32 overflow-y-auto break-words text-gray-600 dark:text-zinc-400">{discovered.models.join(' · ')}</p></div>
                    ) : <Alert type="error">{discovered.message}</Alert>)}
                    {provider.models.length === 0 && <p className="text-sm text-gray-500">Noch keine Modelle angelegt.</p>}
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {provider.models.map((m) => {
                            const r = results[m.id];
                            return (
                                <li key={m.id} className="space-y-1 py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="min-w-0 flex-1"><span className="font-medium">{m.display_name}</span> <code className="text-xs text-gray-500">{m.model_id}</code></div>
                                        {!m.is_enabled && <Badge>Inaktiv</Badge>}{m.is_default && <Badge color="blue">Standard</Badge>}
                                        <Button size="sm" variant="secondary" loading={r?.loading} onClick={() => test(m)}><Plug className="h-4 w-4" /> Testen</Button>
                                        <IconButton label="Modell bearbeiten" onClick={() => onModel(provider, m)}><Pencil className="h-4 w-4" /></IconButton>
                                        <IconButton label="Modell löschen" onClick={() => window.confirm(`Modell „${m.display_name}“ löschen?`) && router.delete(route('admin.models.destroy', m.id), { preserveScroll: true })}><Trash2 className="h-4 w-4" /></IconButton>
                                    </div>
                                    <div className="flex flex-wrap gap-1">{m.capabilities.map((c) => <Badge key={c.capability} color="gray">{c.capability}</Badge>)}</div>
                                    {r && !r.loading && <p className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-emerald-600' : 'text-red-600'}`}>{r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{r.message}{r.latency_ms ? ` · ${r.latency_ms} ms` : ''}</p>}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </Card>
    );
}

export default function Providers({ providers, templates, capabilities }) {
    const [editing, setEditing] = useState(undefined); // undefined = zu, null = neu, Objekt = bearbeiten
    const [modelDialog, setModelDialog] = useState(null);
    const [templateOpen, setTemplateOpen] = useState(false);
    const tpl = useForm({ template: templates[0]?.key || '', name: '', base_url: '', api_key: '', with_models: true });
    const selected = templates.find((t) => t.key === tpl.data.template);

    const createFromTemplate = (e) => {
        e.preventDefault();
        tpl.transform((d) => ({ ...d, api_key: d.api_key || undefined, base_url: d.base_url || undefined, name: d.name || undefined }));
        tpl.post(route('admin.providers.template'), { preserveScroll: true, onSuccess: () => { setTemplateOpen(false); tpl.reset(); } });
    };

    return (
        <AdminLayout title="Provider & Modelle">
            <Head title="Provider & Modelle" />
            <Alert type="info">Es werden ausschliesslich externe, OpenAI-kompatible APIs unterstützt. Schlüssel werden verschlüsselt gespeichert und nur serverseitig verwendet.</Alert>
            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => setTemplateOpen(true)}>Aus Vorlage anlegen</Button>
                <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Eigener Provider</Button>
            </div>

            {providers.length === 0 ? <EmptyState title="Noch kein Provider eingerichtet" description="Lege einen Provider aus einer Vorlage (OpenAI, OpenRouter, Azure …) an, trage den API-Schlüssel ein und teste die Verbindung." /> : (
                <div className="space-y-3">{providers.map((p) => <ProviderCard key={p.id} provider={p} capabilities={capabilities} onEdit={setEditing} onModel={(provider, model) => setModelDialog({ provider, model })} />)}</div>
            )}

            <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Provider bearbeiten' : 'Neuer Provider'} wide>
                {editing !== undefined && <ProviderForm key={editing?.id ?? 'new'} provider={editing} onClose={() => setEditing(undefined)} />}
            </Modal>
            <Modal open={!!modelDialog} onClose={() => setModelDialog(null)} title={modelDialog?.model ? 'Modell bearbeiten' : 'Neues Modell'} wide>
                {modelDialog && <ModelForm key={modelDialog.model?.id ?? 'new'} provider={modelDialog.provider} model={modelDialog.model} capabilities={capabilities} onClose={() => setModelDialog(null)} />}
            </Modal>
            <Modal open={templateOpen} onClose={() => setTemplateOpen(false)} title="Provider aus Vorlage" footer={<><Button variant="secondary" onClick={() => setTemplateOpen(false)}>Abbrechen</Button><Button loading={tpl.processing} onClick={createFromTemplate}>Anlegen</Button></>}>
                <form onSubmit={createFromTemplate} className="space-y-4">
                    <Field label="Vorlage"><Select value={tpl.data.template} onChange={(e) => tpl.setData({ ...tpl.data, template: e.target.value, base_url: '' })}>{templates.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</Select></Field>
                    {selected?.hint && <Alert type="info">{selected.hint}</Alert>}
                    {selected?.docs && <p className="text-xs"><a href={selected.docs} target="_blank" rel="noreferrer" className="text-brand-600 underline">Dokumentation des Anbieters</a></p>}
                    <Field label="Name" error={tpl.errors.name}><Input value={tpl.data.name} onChange={(e) => tpl.setData('name', e.target.value)} placeholder={selected?.name} /></Field>
                    <Field label="Basis-URL" error={tpl.errors.base_url}><Input value={tpl.data.base_url} onChange={(e) => tpl.setData('base_url', e.target.value)} placeholder={selected?.base_url} /></Field>
                    <Field label="API-Schlüssel" hint="Ohne Schlüssel wird der Provider inaktiv angelegt." error={tpl.errors.api_key}><Input type="password" autoComplete="off" value={tpl.data.api_key} onChange={(e) => tpl.setData('api_key', e.target.value)} /></Field>
                    <Toggle checked={tpl.data.with_models} onChange={(v) => tpl.setData('with_models', v)} label="Vorschlagsmodelle mit anlegen" />
                </form>
            </Modal>
        </AdminLayout>
    );
}
