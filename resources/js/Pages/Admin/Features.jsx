import { Head, useForm } from '@inertiajs/react';
import { Badge, Button, Card, Field, Input, Select, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';

const CAP_LABEL = { stt: 'Speech-to-Text', tts: 'Text-to-Speech', image_generation: 'Bildgenerierung', embeddings: 'Embeddings' };

function ConfigFields({ k, config, set }) {
    const num = (name, label, extra = {}) => <Field key={name} label={label}><Input type="number" value={config[name] ?? ''} onChange={(e) => set(name, e.target.value === '' ? null : Number(e.target.value))} {...extra} /></Field>;
    const list = (name, label, hint) => <Field label={label} hint={hint}><Input defaultValue={(config[name] || []).join(',')} onBlur={(e) => set(name, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} /></Field>;

    switch (k) {
        case 'web_search':
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Suchanbieter"><Select value={config.driver || ''} onChange={(e) => set('driver', e.target.value)}><option value="">– wählen –</option><option value="tavily">Tavily</option><option value="brave">Brave Search</option><option value="serper">Serper (Google)</option><option value="searxng">SearXNG (externe Instanz)</option></Select></Field>
                    {config.driver !== 'searxng' ? <Field label="API-Schlüssel" hint="Verschlüsselt gespeichert"><Input type="password" autoComplete="off" value={config.api_key ?? ''} onChange={(e) => set('api_key', e.target.value)} /></Field> : <Field label="Basis-URL der Instanz"><Input value={config.base_url ?? ''} onChange={(e) => set('base_url', e.target.value)} placeholder="https://search.example.org" /></Field>}
                    {num('max_results', 'Max. Ergebnisse', { min: 1, max: 10 })}
                </div>
            );
        case 'stt':
            return <div className="grid gap-4 sm:grid-cols-2">{list('languages', 'Sprachen (Codes)', 'z. B. de,en,fr')}{num('max_seconds', 'Max. Aufnahmedauer (s)')}</div>;
        case 'tts':
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Stimmen (id:Bezeichnung, Komma-getrennt)" hint="z. B. alloy:Alloy,nova:Nova"><Input defaultValue={(config.voices || []).map((v) => (v.label && v.label !== v.id ? `${v.id}:${v.label}` : v.id)).join(',')} onBlur={(e) => set('voices', e.target.value.split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [id, ...rest] = s.split(':'); return { id: id.trim(), label: rest.join(':').trim() || id.trim() }; }))} /></Field>
                    {list('formats', 'Formate', 'mp3,opus,aac,flac,wav')}
                    <Field label="Standardformat"><Input value={config.default_format ?? ''} onChange={(e) => set('default_format', e.target.value)} placeholder="mp3" /></Field>
                    {num('max_chars', 'Max. Zeichen pro Anfrage')}
                    {num('min_speed', 'Min. Geschwindigkeit', { step: 0.05 })}{num('max_speed', 'Max. Geschwindigkeit', { step: 0.05 })}
                </div>
            );
        case 'image_generation':
            return list('sizes', 'Erlaubte Grössen', 'z. B. 1024x1024,1792x1024');
        case 'files':
            return <div className="grid gap-4 sm:grid-cols-2">{num('max_size_mb', 'Max. Dateigrösse (MB)')}{num('max_files_per_message', 'Max. Dateien pro Nachricht')}{list('allowed_extensions', 'Erlaubte Endungen', 'pdf,docx,xlsx,csv,txt,md,png,jpg,jpeg,webp,gif')}</div>;
        case 'memory':
            return <div className="grid gap-4 sm:grid-cols-2">{num('max_items', 'Max. Einträge pro Benutzer')}<div className="self-end"><Toggle checked={config.auto_extract ?? true} onChange={(v) => set('auto_extract', v)} label="Automatisch aus Gesprächen lernen" /></div></div>;
        case 'rag':
            return <div className="grid gap-4 sm:grid-cols-3">{num('chunk_size', 'Chunk-Grösse (Zeichen)')}{num('chunk_overlap', 'Überlappung')}{num('top_k', 'Treffer (Top-K)')}</div>;
        case 'agents':
            return <div className="grid gap-4 sm:grid-cols-2">{num('max_steps', 'Max. Schritte pro Lauf', { min: 1, max: 20 })}</div>;
        default:
            return null;
    }
}

function FeatureCard({ feature, roles, models }) {
    const form = useForm({ is_enabled: feature.is_enabled, ai_model_id: feature.ai_model_id ?? '', config: feature.config || {}, role_ids: feature.role_ids || [] });
    const eligible = feature.needs_model ? models.filter((m) => m.capabilities.includes(feature.needs_model)) : [];
    const setConfig = (key, value) => form.setData('config', { ...form.data.config, [key]: value });
    const status = feature.status;

    const submit = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, ai_model_id: d.ai_model_id === '' ? null : Number(d.ai_model_id) }));
        form.patch(route('admin.features.update', feature.id), { preserveScroll: true });
    };

    return (
        <Card title={feature.name} description={feature.description} actions={<Badge color={status.enabled && status.configured ? 'green' : status.enabled ? 'amber' : 'gray'}>{status.enabled && status.configured ? 'Betriebsbereit' : status.enabled ? 'Nicht konfiguriert' : 'Deaktiviert'}</Badge>}>
            <form onSubmit={submit} className="space-y-4">
                {status.reason && <p className="text-sm text-amber-700 dark:text-amber-300">{status.reason}</p>}
                <Toggle checked={form.data.is_enabled} onChange={(v) => form.setData('is_enabled', v)} label="Funktion aktiv" />
                {feature.needs_model && (
                    <Field label={`Modell (benötigt Capability „${CAP_LABEL[feature.needs_model] || feature.needs_model}“)`} error={form.errors.ai_model_id} hint={eligible.length === 0 ? 'Kein Modell mit dieser Capability vorhanden – unter Provider & Modelle anlegen.' : undefined}>
                        <Select value={form.data.ai_model_id} onChange={(e) => form.setData('ai_model_id', e.target.value)}><option value="">– keines –</option>{eligible.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select>
                    </Field>
                )}
                <ConfigFields k={feature.key} config={form.data.config} set={setConfig} />
                {Object.entries(form.errors).filter(([k]) => k.startsWith('config') || k.startsWith('role')).map(([k, v]) => <p key={k} className="text-xs text-red-600">{v}</p>)}
                <div>
                    <p className="mb-1 text-sm font-medium">Verfügbar für Rollen</p>
                    <div className="flex flex-wrap gap-3">{roles.map((r) => <label key={r.id} className="flex items-center gap-1.5 text-sm"><input type="checkbox" className="rounded border-gray-300 text-brand-600" checked={form.data.role_ids.includes(r.id)} onChange={() => form.setData('role_ids', form.data.role_ids.includes(r.id) ? form.data.role_ids.filter((x) => x !== r.id) : [...form.data.role_ids, r.id])} />{r.name}</label>)}</div>
                    <p className="mt-1 text-xs text-gray-500">Keine Auswahl = für alle Rollen verfügbar.</p>
                </div>
                <div className="flex justify-end"><Button type="submit" loading={form.processing}>Speichern</Button></div>
            </form>
        </Card>
    );
}

export default function Features({ features, roles, models }) {
    return (
        <AdminLayout title="Funktionen">
            <Head title="Funktionen" />
            {features.map((f) => <FeatureCard key={f.id} feature={f} roles={roles} models={models} />)}
        </AdminLayout>
    );
}
