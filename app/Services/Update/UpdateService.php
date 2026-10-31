<?php

namespace App\Services\Update;

use App\Services\AuditService;
use App\Services\SettingsService;
use Closure;
use FilesystemIterator;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\PhpExecutableFinder;
use Symfony\Component\Process\Process;
use Throwable;
use ZipArchive;

/**
 * Aktualisiert die Anwendung direkt aus dem GitHub-ZIP, sobald die VERSION-Datei im Repository
 * grösser ist als die installierte.
 *
 * Ablauf: Version prüfen → ZIP laden und validieren → Wartungsmodus → Dateien mit Backup austauschen
 * → ggf. Composer → Migrationen → Caches leeren → VERSION schreiben → Wartungsmodus beenden.
 * Bei einem Fehler werden alle geänderten Dateien aus dem Backup wiederhergestellt.
 */
class UpdateService
{
    public const VERSION_PATTERN = '/^\d+\.\d+\.\d+$/';

    private const MAX_ZIP_BYTES = 209715200;

    private const MAX_UNPACKED_BYTES = 524288000;

    private const MAX_ENTRIES = 30000;

    /** Verzeichnisse, die vollständig dem Release entsprechen (nicht mehr vorhandene Dateien werden entfernt). */
    private const MIRRORED = ['app', 'config', 'routes', 'resources', 'public/build', 'database/seeders', 'database/factories'];

    /** Pfade, die ein Update nie anfasst. */
    private const PRESERVED = ['.env', '.git/', '.github/', '.claude/', 'node_modules/', 'vendor/', 'storage/', 'bootstrap/cache/', 'tests/', 'public/hot', 'public/storage', 'VERSION'];

    private string $base;

    /**
     * @param  bool  $runCommands  false überspringt Wartungsmodus, Composer, Migrationen und Cache-Leeren (Tests)
     */
    public function __construct(private SettingsService $settings, ?string $basePath = null, private bool $runCommands = true)
    {
        $this->base = rtrim($basePath ?? base_path(), '/\\');
    }

    public function installedVersion(): string
    {
        $file = $this->base.'/VERSION';
        $version = is_file($file) ? trim((string) file_get_contents($file)) : '';

        return preg_match(self::VERSION_PATTERN, $version) ? $version : '0.0.0';
    }

    public function repository(): string
    {
        $repo = trim((string) $this->settings->get('update_repo'));

        return preg_match('/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/', $repo) ? $repo : 'VylarisGroup/vylaris-ai';
    }

    public function branch(): string
    {
        $branch = trim((string) $this->settings->get('update_branch'));

        return preg_match('/^[A-Za-z0-9_.\/-]+$/', $branch) && ! str_contains($branch, '..') ? $branch : 'main';
    }

    private function token(): ?string
    {
        return trim((string) $this->settings->get('update_token')) ?: null;
    }

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $decoded = json_decode((string) $this->settings->get('update_status'), true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param  array<string, mixed>  $patch
     */
    private function remember(array $patch): void
    {
        $this->settings->set('update_status', json_encode(array_merge($this->status(), $patch), JSON_UNESCAPED_UNICODE));
    }

    /**
     * Liest die VERSION-Datei des Repositories bei GitHub.
     */
    public function remoteVersion(): string
    {
        $repo = $this->repository();
        $branch = $this->branch();
        $request = Http::timeout(15)->withHeaders(['User-Agent' => 'Vylaris-Updater']);

        $response = $this->token()
            ? $request->withToken($this->token())->withHeaders(['Accept' => 'application/vnd.github.raw+json'])->get("https://api.github.com/repos/{$repo}/contents/VERSION", ['ref' => $branch])
            : $request->get("https://raw.githubusercontent.com/{$repo}/{$branch}/VERSION");

        if (! $response->successful()) {
            throw new UpdateException(match ($response->status()) {
                404 => "VERSION-Datei in {$repo} ({$branch}) nicht gefunden. Bei privaten Repositories ein GitHub-Token hinterlegen.",
                401, 403 => 'GitHub hat den Zugriff verweigert (Token ungültig oder Rate-Limit erreicht).',
                default => 'GitHub ist nicht erreichbar (HTTP '.$response->status().').',
            });
        }

        $version = trim($response->body());

        if (! preg_match(self::VERSION_PATTERN, $version)) {
            throw new UpdateException('Die VERSION-Datei im Repository hat ein ungültiges Format (erwartet: 1.2.3).');
        }

        return $version;
    }

    /**
     * Vergleicht installierte und veröffentlichte Version und merkt sich das Ergebnis.
     *
     * @return array{installed: string, remote: string, available: bool, checked_at: string}
     */
    public function check(): array
    {
        $installed = $this->installedVersion();

        try {
            $remote = $this->remoteVersion();
        } catch (UpdateException $e) {
            $this->remember(['checked_at' => now()->toIso8601String(), 'check_error' => $e->getMessage()]);

            throw $e;
        }

        $result = ['installed' => $installed, 'remote' => $remote, 'available' => version_compare($remote, $installed, '>'), 'checked_at' => now()->toIso8601String()];
        $this->remember(['remote' => $remote, 'checked_at' => $result['checked_at'], 'check_error' => null]);

        return $result;
    }

    /**
     * Führt das Update aus.
     *
     * @param  (Closure(string): void)|null  $onLog
     * @return array{from: string, to: string, log: array<int, string>}
     */
    public function apply(?Closure $onLog = null): array
    {
        $lock = Cache::lock('app-update', 900);

        if (! $lock->get()) {
            throw new UpdateException('Es läuft bereits ein Update.');
        }

        $entries = [];
        $log = function (string $message) use (&$entries, $onLog): void {
            $entries[] = $message;

            if ($onLog) {
                $onLog($message);
            }
        };

        $from = $this->installedVersion();
        $to = $from;
        $work = null;

        try {
            set_time_limit(0);
            ignore_user_abort(true);

            $to = $this->remoteVersion();

            if (! version_compare($to, $from, '>')) {
                throw new UpdateException("Keine neuere Version verfügbar (installiert: {$from}, GitHub: {$to}).");
            }

            $log("Update {$from} → {$to}");
            $work = $this->base.'/storage/app/updates/'.date('Ymd-His').'-'.$to;

            if (! is_dir($work.'/extract') && ! @mkdir($work.'/extract', 0775, true)) {
                throw new UpdateException('Das Arbeitsverzeichnis storage/app/updates ist nicht beschreibbar.');
            }

            $this->download($work.'/release.zip');
            $log('Release-Archiv geladen.');

            $release = $this->inspect($work.'/release.zip', $to);
            $log('Archiv geprüft.');

            if ($release['composer_changed']) {
                $composer = $this->runCommands ? $this->composerCommand() : null;

                if ($this->runCommands && ! $composer) {
                    throw new UpdateException('Dieses Update benötigt neue Composer-Abhängigkeiten, aber Composer ist auf dem Server nicht verfügbar. Bitte lokal „composer install --no-dev“ ausführen und vendor/ hochladen, oder Composer installieren.');
                }
            }

            $zip = new ZipArchive;
            $zip->open($work.'/release.zip');
            $zip->extractTo($work.'/extract');
            $zip->close();

            $source = $work.'/extract/'.$release['prefix'];
            $plan = $this->plan($source);
        } catch (Throwable $e) {
            $this->fail($e, $from, $to, $entries);
            $this->cleanup($work, false);
            $lock->release();

            throw $e instanceof UpdateException ? $e : new UpdateException('Update fehlgeschlagen: '.$e->getMessage(), 0, $e);
        }

        $changes = ['replaced' => [], 'created' => []];
        $maintenance = false;

        try {
            if ($this->runCommands) {
                Artisan::call('down', ['--retry' => 60]);
                $maintenance = true;
                $log('Wartungsmodus aktiviert.');
            }

            $this->install($source, $plan, $work.'/backup', $changes);
            $log(count($plan['copy']).' Dateien aktualisiert, '.count($plan['delete']).' entfernt.');

            if ($this->runCommands) {
                if ($release['composer_changed'] && ($composer ?? null)) {
                    $this->runProcess($composer, 'Composer');
                    $log('Composer-Abhängigkeiten aktualisiert.');
                }

                Artisan::call('migrate', ['--force' => true]);
                $log('Datenbank-Migrationen ausgeführt.');
            }

            if (file_put_contents($this->base.'/VERSION', $to."\n", LOCK_EX) === false) {
                throw new UpdateException('VERSION konnte nicht geschrieben werden.');
            }

            if ($this->runCommands) {
                Artisan::call('optimize:clear');
                Artisan::call('queue:restart');
                $log('Caches geleert.');
            }

            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }
        } catch (Throwable $e) {
            $this->rollback($work.'/backup', $changes);
            $log('Fehler – Änderungen wurden zurückgesetzt.');
            $this->fail($e, $from, $to, $entries);

            throw $e instanceof UpdateException ? $e : new UpdateException('Update fehlgeschlagen: '.$e->getMessage(), 0, $e);
        } finally {
            if ($maintenance) {
                Artisan::call('up');
            }

            $lock->release();
        }

        $this->cleanup($work, true, "{$from}-to-{$to}");
        $this->remember(['remote' => $to, 'last_result' => ['ok' => true, 'message' => "Aktualisiert von {$from} auf {$to}.", 'from' => $from, 'to' => $to, 'at' => now()->toIso8601String(), 'log' => $entries], 'failed_version' => null]);

        try {
            AuditService::log('update.applied', null, ['from' => $from, 'to' => $to]);
        } catch (Throwable) {
            // Audit-Tabelle kann durch das Update gerade erst entstanden sein
        }

        return ['from' => $from, 'to' => $to, 'log' => $entries];
    }

    /**
     * @param  array<int, string>  $entries
     */
    private function fail(Throwable $e, string $from, string $to, array $entries): void
    {
        $this->remember(['last_result' => ['ok' => false, 'message' => $e->getMessage(), 'from' => $from, 'to' => $to, 'at' => now()->toIso8601String(), 'log' => $entries], 'failed_version' => $to]);

        try {
            AuditService::log('update.failed', null, ['from' => $from, 'to' => $to, 'error' => mb_substr($e->getMessage(), 0, 300)]);
        } catch (Throwable) {
            // Protokollierung darf den Fehlerpfad nicht verdecken
        }
    }

    private function download(string $target): void
    {
        $repo = $this->repository();
        $request = Http::timeout(300)->withHeaders(['User-Agent' => 'Vylaris-Updater', 'Accept' => 'application/vnd.github+json'])->sink($target);

        if ($this->token()) {
            $request = $request->withToken($this->token());
        }

        $response = $request->get("https://api.github.com/repos/{$repo}/zipball/{$this->branch()}");

        if (! $response->successful()) {
            throw new UpdateException('Das Release-Archiv konnte nicht geladen werden (HTTP '.$response->status().').');
        }

        $size = @filesize($target);

        if (! $size || $size > self::MAX_ZIP_BYTES) {
            throw new UpdateException('Das Release-Archiv ist leer oder zu gross.');
        }
    }

    /**
     * Validiert das Archiv (Pfade, Grösse, Version, Frontend-Build) bevor etwas verändert wird.
     *
     * @return array{prefix: string, composer_changed: bool}
     */
    private function inspect(string $zipPath, string $expectedVersion): array
    {
        $zip = new ZipArchive;

        if ($zip->open($zipPath) !== true) {
            throw new UpdateException('Das Release-Archiv ist kein gültiges ZIP.');
        }

        try {
            if ($zip->numFiles < 1 || $zip->numFiles > self::MAX_ENTRIES) {
                throw new UpdateException('Das Release-Archiv hat eine unerwartete Struktur.');
            }

            $prefix = null;
            $unpacked = 0;

            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                $name = (string) $stat['name'];
                $unpacked += (int) $stat['size'];

                if ($name === '' || str_contains($name, '\\') || str_contains($name, "\0") || str_starts_with($name, '/') || preg_match('#(^|/)\.\.(/|$)#', $name) || preg_match('#^[A-Za-z]:#', $name)) {
                    throw new UpdateException('Das Release-Archiv enthält unzulässige Pfade und wurde abgelehnt.');
                }

                $first = explode('/', $name, 2)[0];
                $prefix ??= $first;

                if ($first !== $prefix || ! str_contains($name, '/')) {
                    throw new UpdateException('Das Release-Archiv hat eine unerwartete Struktur.');
                }
            }

            if ($unpacked > self::MAX_UNPACKED_BYTES) {
                throw new UpdateException('Das Release-Archiv ist entpackt zu gross.');
            }

            $prefix .= '/';
            $version = trim((string) $zip->getFromName($prefix.'VERSION'));

            if ($version !== $expectedVersion) {
                throw new UpdateException("Die VERSION im Archiv ({$version}) stimmt nicht mit GitHub ({$expectedVersion}) überein.");
            }

            foreach (['artisan', 'bootstrap/app.php', 'composer.json'] as $required) {
                if ($zip->locateName($prefix.$required) === false) {
                    throw new UpdateException("Im Archiv fehlt {$required}; es ist keine gültige Vylaris-AI-Version.");
                }
            }

            if ($zip->locateName($prefix.'public/build/manifest.json') === false) {
                throw new UpdateException('Das Release enthält keinen gebauten Frontend-Build (public/build). Das Update wurde zum Schutz der Installation abgebrochen.');
            }

            $remoteLock = $zip->getFromName($prefix.'composer.lock');
            $localLock = is_file($this->base.'/composer.lock') ? (string) file_get_contents($this->base.'/composer.lock') : '';

            return ['prefix' => $prefix, 'composer_changed' => $remoteLock !== false && hash('sha256', $remoteLock) !== hash('sha256', $localLock)];
        } finally {
            $zip->close();
        }
    }

    /**
     * @return array{copy: array<int, string>, delete: array<int, string>}
     */
    private function plan(string $source): array
    {
        $new = [];

        foreach ($this->listFiles(rtrim($source, '/')) as $relative) {
            $new[$relative] = true;
        }

        $copy = array_values(array_filter(array_keys($new), fn (string $path) => ! $this->isPreserved($path)));
        sort($copy);

        $delete = [];

        foreach (self::MIRRORED as $directory) {
            foreach ($this->listFiles($this->base.'/'.$directory, $directory.'/') as $relative) {
                if (! isset($new[$relative]) && ! $this->isPreserved($relative)) {
                    $delete[] = $relative;
                }
            }
        }

        return ['copy' => $copy, 'delete' => $delete];
    }

    private function isPreserved(string $relative): bool
    {
        foreach (self::PRESERVED as $pattern) {
            if ($relative === $pattern || (str_ends_with($pattern, '/') && str_starts_with($relative, $pattern))) {
                return true;
            }
        }

        if (str_ends_with($relative, '.sqlite') || str_ends_with($relative, '.sqlite-journal')) {
            return true;
        }

        return $relative === 'public/install.php' && is_file($this->base.'/storage/app/installed.lock');
    }

    /**
     * @return array<int, string>
     */
    private function listFiles(string $directory, string $prefix = ''): array
    {
        if (! is_dir($directory)) {
            return [];
        }

        $files = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile() && ! $file->isLink()) {
                $files[] = $prefix.str_replace('\\', '/', substr($file->getPathname(), strlen($directory) + 1));
            }
        }

        return $files;
    }

    /**
     * Tauscht die Dateien aus und sichert dabei jede überschriebene oder gelöschte Datei.
     *
     * @param  array{copy: array<int, string>, delete: array<int, string>}  $plan
     * @param  array{replaced: array<int, string>, created: array<int, string>}  $changes
     */
    private function install(string $source, array $plan, string $backup, array &$changes): void
    {
        foreach ($plan['delete'] as $relative) {
            $this->backupFile($relative, $backup, $changes);

            if (! @unlink($this->base.'/'.$relative)) {
                throw new UpdateException("Datei {$relative} konnte nicht entfernt werden (Schreibrechte prüfen).");
            }
        }

        foreach ($plan['copy'] as $relative) {
            $target = $this->base.'/'.$relative;

            if (! is_dir(dirname($target)) && ! @mkdir(dirname($target), 0775, true)) {
                throw new UpdateException('Verzeichnis für '.$relative.' konnte nicht angelegt werden (Schreibrechte prüfen).');
            }

            if (is_file($target)) {
                if (hash_file('sha256', $target) === hash_file('sha256', $source.'/'.$relative)) {
                    continue;
                }

                $this->backupFile($relative, $backup, $changes);
            } else {
                $changes['created'][] = $relative;
            }

            if (! @copy($source.'/'.$relative, $target)) {
                throw new UpdateException("Datei {$relative} konnte nicht geschrieben werden (Schreibrechte prüfen).");
            }
        }
    }

    /**
     * @param  array{replaced: array<int, string>, created: array<int, string>}  $changes
     */
    private function backupFile(string $relative, string $backup, array &$changes): void
    {
        $target = $this->base.'/'.$relative;

        if (! is_file($target)) {
            return;
        }

        if (! is_dir(dirname($backup.'/'.$relative))) {
            mkdir(dirname($backup.'/'.$relative), 0775, true);
        }

        if (! copy($target, $backup.'/'.$relative)) {
            throw new UpdateException("Backup von {$relative} fehlgeschlagen; Update abgebrochen.");
        }

        $changes['replaced'][] = $relative;
    }

    /**
     * @param  array{replaced: array<int, string>, created: array<int, string>}  $changes
     */
    private function rollback(string $backup, array $changes): void
    {
        foreach ($changes['created'] as $relative) {
            @unlink($this->base.'/'.$relative);
        }

        foreach ($changes['replaced'] as $relative) {
            $dir = dirname($this->base.'/'.$relative);

            if (! is_dir($dir)) {
                @mkdir($dir, 0775, true);
            }

            @copy($backup.'/'.$relative, $this->base.'/'.$relative);
        }
    }

    /**
     * @return array<int, string>|null
     */
    private function composerCommand(): ?array
    {
        if (! function_exists('proc_open')) {
            return null;
        }

        $php = (new PhpExecutableFinder)->find();

        if (! $php) {
            return null;
        }

        $args = ['install', '--no-interaction', '--no-progress', '--optimize-autoloader', ...(app()->isProduction() ? ['--no-dev'] : [])];

        if (is_file($this->base.'/composer.phar')) {
            return [$php, $this->base.'/composer.phar', ...$args];
        }

        $binary = (new ExecutableFinder)->find('composer');

        return $binary ? [$binary, ...$args] : null;
    }

    /**
     * @param  array<int, string>  $command
     */
    private function runProcess(array $command, string $label): void
    {
        $home = $this->base.'/storage/app/updates/.composer';
        @mkdir($home, 0775, true);

        $process = new Process($command, $this->base, ['COMPOSER_HOME' => $home, 'COMPOSER_ALLOW_SUPERUSER' => '1'], null, 900);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new UpdateException("{$label} ist fehlgeschlagen: ".mb_substr(trim($process->getErrorOutput() ?: $process->getOutput()), -400));
        }
    }

    /**
     * Räumt das Arbeitsverzeichnis auf; bei Erfolg bleibt das Backup erhalten (die letzten drei).
     */
    private function cleanup(?string $work, bool $keepBackup, string $label = ''): void
    {
        if (! $work || ! is_dir($work)) {
            return;
        }

        $this->removeDirectory($work.'/extract');
        @unlink($work.'/release.zip');

        $updates = $this->base.'/storage/app/updates';

        if ($keepBackup && is_dir($work.'/backup')) {
            @rename($work, $updates.'/backup-'.date('Ymd-His').'-'.$label);

            $backups = glob($updates.'/backup-*', GLOB_ONLYDIR) ?: [];
            sort($backups);

            foreach (array_slice($backups, 0, max(0, count($backups) - 3)) as $old) {
                $this->removeDirectory($old);
            }

            return;
        }

        $this->removeDirectory($work);
    }

    private function removeDirectory(string $directory): void
    {
        if (! is_dir($directory)) {
            return;
        }

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);

        foreach ($iterator as $item) {
            $item->isDir() && ! $item->isLink() ? @rmdir($item->getPathname()) : @unlink($item->getPathname());
        }

        @rmdir($directory);
    }

    /**
     * Systemvoraussetzungen für Updates (für die Admin-Oberfläche).
     *
     * @return array<int, array{name: string, ok: bool, detail: string}>
     */
    public function requirements(): array
    {
        $writable = is_writable($this->base) && is_writable($this->base.'/app') && is_writable($this->base.'/public');

        return [
            ['name' => 'PHP-Erweiterung zip', 'ok' => class_exists(ZipArchive::class), 'detail' => ''],
            ['name' => 'Programmdateien beschreibbar', 'ok' => $writable, 'detail' => $writable ? '' : 'Webserver-Benutzer braucht Schreibrechte auf das Projektverzeichnis.'],
            ['name' => 'Composer verfügbar', 'ok' => $this->composerCommand() !== null, 'detail' => 'Nur nötig, wenn ein Update neue PHP-Abhängigkeiten mitbringt.'],
        ];
    }
}
