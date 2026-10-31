import { Head, router, useForm } from '@inertiajs/react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Field, Input, Toggle } from '@/Components/ui';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/lib/api';

function CopyField({ value }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            // Zwischenablage nicht verfügbar
        }
    };

    return (
        <div className="flex gap-2">
            <Input readOnly value={value} onFocus={(e) => e.target.select()} aria-label="Cron-URL" className="font-mono text-xs" />
            <Button type="button" variant="secondary" onClick={copy} aria-label="URL kopieren">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
        </div>
    );
}

export default function Updates({ installed, remote, available, status, settings, requirements, cron }) {
    const [busy, setBusy] = useState(null);
    const form = useForm({ repo: settings.repo, branch: settings.branch, auto: settings.auto, token: '', clear_token: false });
    const result = status.last_result;
    const run = (name, url, confirm) => {
        if (confirm && !window.confirm(confirm)) return;
        router.post(url, {}, { preserveScroll: true, onStart: () => setBusy(name), onFinish: () => setBusy(null) });
    };

    const blocked = requirements.filter((r) => !r.ok && r.name !== 'Composer verfügbar');

    return (
        <AdminLayout title="Updates & Cron">
            <Head title="Updates & Cron" />

            <Card title="Version" description="Die Plattform lädt Updates direkt als ZIP von GitHub, sobald die Datei VERSION im Repository höher ist als die installierte.">
                <dl className="grid gap-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-gray-500">Installiert</dt><dd className="text-xl font-semibold tabular-nums">{installed}</dd></div>
                    <div><dt className="text-gray-500">Auf GitHub</dt><dd className="text-xl font-semibold tabular-nums">{remote || '–'}</dd></div>
                    <div><dt className="text-gray-500">Status</dt><dd className="mt-1">{available ? <Badge color="amber">Update verfügbar</Badge> : remote ? <Badge color="green">Aktuell</Badge> : <Badge>Noch nicht geprüft</Badge>}</dd></div>
                </dl>
                {status.checked_at && <p className="mt-3 text-xs text-gray-500">Zuletzt geprüft: {formatDate(status.checked_at)}</p>}
                {status.check_error && <div className="mt-3"><Alert type="warning">{status.check_error}</Alert></div>}
                {blocked.length > 0 && <div className="mt-3"><Alert type="error">{blocked.map((r) => `${r.name}: ${r.detail || 'nicht erfüllt'}`).join(' ')}</Alert></div>}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" loading={busy === 'check'} onClick={() => run('check', route('admin.updates.check'))}><RefreshCw className="h-4 w-4" /> Jetzt prüfen</Button>
                    <Button disabled={!available || blocked.length > 0} loading={busy === 'apply'} onClick={() => run('apply', route('admin.updates.apply'), `Update auf ${remote} installieren? Die Plattform ist währenddessen kurz im Wartungsmodus. Ein Backup der geänderten Dateien wird angelegt.`)}>Auf {remote || 'neueste Version'} aktualisieren</Button>
                </div>
                {busy === 'apply' && <p className="mt-3 text-sm text-gray-500" role="status">Update läuft – bitte Seite nicht schliessen …</p>}
            </Card>

            {result && (
                <Card title="Letztes Update">
                    <Alert type={result.ok ? 'success' : 'error'}>{result.message}</Alert>
                    <p className="mt-2 text-xs text-gray-500">{formatDate(result.at)}</p>
                    {result.log?.length > 0 && <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs dark:bg-zinc-800">{result.log.join('\n')}</pre>}
                </Card>
            )}

            <Card title="Update-Quelle">
                <form onSubmit={(e) => { e.preventDefault(); form.patch(route('admin.updates.settings'), { preserveScroll: true, onSuccess: () => form.reset('token', 'clear_token') }); }} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="GitHub-Repository" hint="Format: Organisation/Repository" error={form.errors.repo}><Input value={form.data.repo} onChange={(e) => form.setData('repo', e.target.value)} required /></Field>
                        <Field label="Branch" error={form.errors.branch}><Input value={form.data.branch} onChange={(e) => form.setData('branch', e.target.value)} required /></Field>
                    </div>
                    <Field label="GitHub-Token (nur für private Repositories)" hint={settings.has_token ? 'Ein Token ist gespeichert (verschlüsselt). Leer lassen, um ihn beizubehalten.' : 'Fine-grained Token mit Lesezugriff auf „Contents“. Wird verschlüsselt gespeichert.'} error={form.errors.token}><Input type="password" autoComplete="off" value={form.data.token} onChange={(e) => form.setData('token', e.target.value)} /></Field>
                    {settings.has_token && <Toggle checked={form.data.clear_token} onChange={(v) => form.setData('clear_token', v)} label="Gespeicherten Token entfernen" />}
                    <Toggle checked={form.data.auto} onChange={(v) => form.setData('auto', v)} label="Automatisch aktualisieren" description="Stündlich über den Scheduler (Cron): Ist die VERSION auf GitHub höher, wird das Update ohne Rückfrage installiert. Ein fehlgeschlagenes Update wird nicht automatisch wiederholt." />
                    <div className="flex justify-end"><Button type="submit" loading={form.processing}>Speichern</Button></div>
                </form>
            </Card>

            <Card title="Cron per URL" description="Für Hosting ohne Shell-Cron: Diese URL jede Minute aufrufen. Sie startet den Scheduler (Log-Bereinigung, automatische Updates) und bei Datenbank-Queue kurz den Queue-Worker.">
                <div className="space-y-3">
                    <CopyField value={cron.url} />
                    <p className="text-xs text-gray-500">Der Token in der URL ersetzt die Anmeldung – URL geheim halten. Letzter Aufruf: {cron.last_run ? formatDate(cron.last_run) : 'noch nie'} · Queue-Modus: <code>{cron.queue}</code></p>
                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                        <p className="mb-1 font-medium">Einrichtung</p>
                        <ul className="list-disc space-y-1 pl-4">
                            <li>Plesk: „Geplante Aufgaben“ → Typ „URL abrufen“ → Intervall jede Minute.</li>
                            <li>Externer Dienst (z. B. cron-job.org): URL im Minutentakt aufrufen.</li>
                            <li>Crontab: <code>* * * * * curl -fsS "{cron.url}" &gt; /dev/null</code></li>
                        </ul>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => run('token', route('admin.updates.cron-token'), 'Neue Cron-URL erzeugen? Die bisherige URL funktioniert danach nicht mehr.')}>URL neu erzeugen</Button>
                </div>
            </Card>

            <Card title="Voraussetzungen">
                <ul className="divide-y divide-gray-100 text-sm dark:divide-zinc-800">
                    {requirements.map((r) => <li key={r.name} className="flex items-start justify-between gap-3 py-2"><span>{r.name}</span><span className={r.ok ? 'text-emerald-600' : 'text-amber-600'}>{r.ok ? '✓' : '✗'} {!r.ok && r.detail}</span></li>)}
                </ul>
            </Card>
        </AdminLayout>
    );
}
