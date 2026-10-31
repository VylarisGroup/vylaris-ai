import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Card, Field, Input, Select, Textarea, Toggle } from '@/Components/ui';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { applyTheme } from '@/lib/theme';
import { useTts } from '@/hooks/useVoice';

const LANGUAGES = [['de', 'Deutsch'], ['en', 'Englisch'], ['fr', 'Französisch'], ['it', 'Italienisch'], ['es', 'Spanisch'], ['pt', 'Portugiesisch'], ['nl', 'Niederländisch']];

export default function Preferences({ settings }) {
    const { features } = usePage().props;
    const voice = settings.voice || {};
    const form = useForm({
        custom_instructions: settings.custom_instructions || '',
        about_me: settings.about_me || '',
        theme: settings.theme || 'system',
        stt_language: settings.stt_language || 'de',
        voice: { name: voice.name || '', speed: voice.speed ?? 1, format: voice.format || 'mp3', language: voice.language || 'de', auto_read: !!voice.auto_read },
    });
    const tts = useTts('settings-preview', { name: form.data.voice.name, speed: form.data.voice.speed, format: form.data.voice.format });
    const setVoice = (key, value) => form.setData('voice', { ...form.data.voice, [key]: value });
    const ttsOn = (features.tts?.enabled && features.tts?.configured);
    const sttOn = (features.stt?.enabled && features.stt?.configured);

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('settings.update'), { preserveScroll: true, onSuccess: () => applyTheme(form.data.theme) });
    };

    return (
        <SettingsLayout title="Persönlich & KI">
            <Head title="Einstellungen" />
            <form onSubmit={submit} className="space-y-6">
                <Card title="Anpassung" description="Diese Angaben fliessen in jede Unterhaltung ein. Du siehst und steuerst alles, was die KI über dich weiss.">
                    <div className="space-y-4">
                        <Field label="Über mich" hint="Was soll die KI über dich wissen? (Beruf, Interessen, Sprache …)" error={form.errors.about_me}><Textarea rows={3} maxLength={2000} value={form.data.about_me} onChange={(e) => form.setData('about_me', e.target.value)} /></Field>
                        <Field label="Eigene Anweisungen" hint="Wie soll die KI antworten? (Ton, Format, Länge …)" error={form.errors.custom_instructions}><Textarea rows={4} maxLength={5000} value={form.data.custom_instructions} onChange={(e) => form.setData('custom_instructions', e.target.value)} /></Field>
                    </div>
                </Card>

                <Card title="Darstellung">
                    <Field label="Farbschema">
                        <Select value={form.data.theme} onChange={(e) => form.setData('theme', e.target.value)} className="max-w-xs">
                            <option value="system">System</option><option value="light">Hell</option><option value="dark">Dunkel</option>
                        </Select>
                    </Field>
                </Card>

                <Card title="Sprache" description="Anbieter und Modelle für Spracheingabe (STT) und Sprachausgabe (TTS) legt der Administrator fest.">
                    <div className="space-y-4">
                        {!sttOn && <Alert type="info">Spracheingabe ist nicht eingerichtet{features.stt?.reason ? `: ${features.stt.reason}` : '.'}</Alert>}
                        {!ttsOn && <Alert type="info">Sprachausgabe ist nicht eingerichtet{features.tts?.reason ? `: ${features.tts.reason}` : '.'}</Alert>}
                        <Field label="Sprache der Spracheingabe">
                            <Select value={form.data.stt_language} onChange={(e) => form.setData('stt_language', e.target.value)} disabled={!sttOn} className="max-w-xs">
                                {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                            </Select>
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="Stimme" hint="Leer = Standardstimme"><Input value={form.data.voice.name} onChange={(e) => setVoice('name', e.target.value)} disabled={!ttsOn} placeholder="z. B. alloy" /></Field>
                            <Field label={`Geschwindigkeit (${Number(form.data.voice.speed).toFixed(2)}×)`}><input type="range" min="0.5" max="2" step="0.05" value={form.data.voice.speed} onChange={(e) => setVoice('speed', Number(e.target.value))} disabled={!ttsOn} className="w-full accent-brand-600" /></Field>
                            <Field label="Audioformat">
                                <Select value={form.data.voice.format} onChange={(e) => setVoice('format', e.target.value)} disabled={!ttsOn}>
                                    {['mp3', 'opus', 'aac', 'flac', 'wav'].map((f) => <option key={f}>{f}</option>)}
                                </Select>
                            </Field>
                        </div>
                        <Toggle checked={form.data.voice.auto_read} onChange={(v) => setVoice('auto_read', v)} disabled={!ttsOn} label="Antworten automatisch vorlesen" />
                        <Button type="button" variant="secondary" size="sm" disabled={!ttsOn} onClick={() => tts.speak('Dies ist eine Hörprobe der gewählten Stimme.')}>{tts.status === 'idle' ? 'Hörprobe' : tts.status === 'loading' ? 'Lädt …' : 'Stopp'}</Button>
                    </div>
                </Card>

                <div className="flex justify-end"><Button type="submit" loading={form.processing}>Speichern</Button></div>
            </form>
        </SettingsLayout>
    );
}
