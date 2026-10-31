<?php

/**
 * Vylaris AI – Web-Installer
 *
 * Richtet die Plattform beim ersten Aufruf ein: Systemprüfung, .env, App-Key, Datenbank-Migrationen,
 * Rollen/Funktionskatalog und den ersten Administrator. Danach sperrt sich der Installer
 * (storage/app/installed.lock) und versucht, sich selbst zu löschen.
 *
 * Voraussetzung: `vendor/` (composer install) und `public/build/` (npm run build) sind vorhanden.
 */

declare(strict_types=1);
use Illuminate\Contracts\Console\Kernel;

const ROOT_REL = '/..';

$root = realpath(__DIR__.ROOT_REL) ?: dirname(__DIR__);
$lockFile = $root.'/storage/app/installed.lock';
$keyFile = $root.'/storage/app/install-key.txt';
$envFile = $root.'/.env';

error_reporting(E_ALL);
ini_set('display_errors', '0');
set_time_limit(300);
session_name('vylaris_install');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => ! empty($_SERVER['HTTPS'])]);
session_start();

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");

function h(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function envValue(string $file, string $key): string
{
    if (! is_file($file)) {
        return '';
    }

    return preg_match('/^'.preg_quote($key, '/').'=(.*)$/m', (string) file_get_contents($file), $m) ? trim($m[1], " \t\"'") : '';
}

/** @param array<string, string> $values */
function writeEnv(string $file, string $template, array $values): void
{
    $lines = preg_split('/\R/', is_file($file) ? (string) file_get_contents($file) : $template) ?: [];

    foreach ($values as $key => $value) {
        if ($value !== '' && ! str_starts_with($value, '${') && ! preg_match('/^[A-Za-z0-9_.\/:@,+-]+$/', $value)) {
            $value = "'".str_replace(['\\', "'"], ['\\\\', "\\'"], $value)."'";
        }

        $found = false;

        foreach ($lines as $i => $line) {
            if (preg_match('/^\s*#?\s*'.preg_quote($key, '/').'=/', $line)) {
                $lines[$i] = "{$key}={$value}";
                $found = true;
                break;
            }
        }

        if (! $found) {
            $lines[] = "{$key}={$value}";
        }
    }

    if (file_put_contents($file, implode("\n", $lines)."\n", LOCK_EX) === false) {
        throw new RuntimeException('Die Datei .env konnte nicht geschrieben werden.');
    }

    @chmod($file, 0640);
}

function page(string $title, string $body): never
{
    echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">'
        .'<title>'.h($title).'</title><style>
        :root{color-scheme:light dark;--bg:#f8fafc;--card:#fff;--fg:#0f172a;--mut:#64748b;--bd:#e2e8f0;--pri:#4f46e5;--ok:#059669;--err:#dc2626;--warn:#d97706}
        @media(prefers-color-scheme:dark){:root{--bg:#09090b;--card:#18181b;--fg:#f4f4f5;--mut:#a1a1aa;--bd:#3f3f46;--pri:#818cf8}}
        *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;padding:24px 16px}
        main{max-width:640px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:24px 0 8px}
        .card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:20px;margin-top:16px}
        label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}small{display:block;color:var(--mut);font-size:12px;margin-top:3px}
        input,select{width:100%;padding:9px 11px;border:1px solid var(--bd);border-radius:8px;background:transparent;color:inherit;font:inherit}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:520px){.row{grid-template-columns:1fr}}
        button,.btn{display:inline-block;margin-top:20px;padding:10px 18px;border:0;border-radius:9px;background:var(--pri);color:#fff;font:600 15px system-ui;cursor:pointer;text-decoration:none}
        ul{list-style:none;padding:0;margin:0}li{padding:6px 0;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;gap:12px}li:last-child{border:0}
        .ok{color:var(--ok)}.err{color:var(--err)}.warn{color:var(--warn)}.alert{padding:10px 14px;border-radius:9px;border:1px solid var(--err);color:var(--err);margin-top:14px}
        pre{white-space:pre-wrap;background:rgba(127,127,127,.12);padding:10px;border-radius:8px;font-size:12px;overflow:auto}code{background:rgba(127,127,127,.15);padding:1px 5px;border-radius:4px}
        </style></head><body><main><h1>Vylaris AI – Installation</h1>'.$body.'</main></body></html>';
    exit;
}

// ---------------------------------------------------------------- Bereits installiert?
if (is_file($lockFile)) {
    http_response_code(403);
    page('Bereits installiert', '<div class="card"><p><strong>Vylaris AI ist bereits installiert.</strong></p><p>Aus Sicherheitsgründen ist der Installer gesperrt. Bitte lösche <code>public/install.php</code> vom Server.</p><a class="btn" href="/">Zur Anwendung</a></div>');
}

$keyExists = is_file($keyFile);

if (! $keyExists && envValue($envFile, 'APP_KEY') !== '') {
    http_response_code(403);
    page('Bereits konfiguriert', '<div class="card"><p><strong>Diese Installation ist bereits konfiguriert.</strong></p><p>Der Installer kann nur auf einer frischen Installation laufen. Lösche <code>public/install.php</code> oder nutze die Konsole (<code>php artisan migrate --seed</code> und <code>php artisan vylaris:make-admin</code>).</p></div>');
}

// ---------------------------------------------------------------- Systemprüfung
$checks = [];
$add = function (string $name, bool $ok, string $detail = '', bool $blocking = true) use (&$checks): void {
    $checks[] = ['name' => $name, 'ok' => $ok, 'detail' => $detail, 'blocking' => $blocking];
};

$add('PHP ≥ 8.3', version_compare(PHP_VERSION, '8.3.0', '>='), PHP_VERSION);

foreach (['ctype', 'curl', 'dom', 'fileinfo', 'json', 'mbstring', 'openssl', 'pdo', 'tokenizer', 'xml', 'zip'] as $ext) {
    $add("Erweiterung {$ext}", extension_loaded($ext), extension_loaded($ext) ? '' : 'fehlt');
}

$add('PDO SQLite oder MySQL', extension_loaded('pdo_sqlite') || extension_loaded('pdo_mysql'), implode(', ', array_filter([extension_loaded('pdo_sqlite') ? 'sqlite' : null, extension_loaded('pdo_mysql') ? 'mysql' : null])) ?: 'fehlt');
$add('Composer-Abhängigkeiten (vendor/)', is_file($root.'/vendor/autoload.php'), is_file($root.'/vendor/autoload.php') ? '' : 'Bitte „composer install --no-dev“ ausführen.');
$add('Frontend gebaut (public/build)', is_file(__DIR__.'/build/manifest.json'), is_file(__DIR__.'/build/manifest.json') ? '' : 'Lokal „npm run build“ ausführen und public/build hochladen.');

foreach (['storage/app', 'storage/framework/cache', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs', 'bootstrap/cache', 'database'] as $dir) {
    if (! is_dir($root.'/'.$dir)) {
        @mkdir($root.'/'.$dir, 0775, true);
    }

    $add("Schreibbar: {$dir}", is_dir($root.'/'.$dir) && is_writable($root.'/'.$dir), is_writable($root.'/'.$dir) ? '' : 'nicht beschreibbar');
}

$add('Schreibbar: .env', is_file($envFile) ? is_writable($envFile) : is_writable($root), '');
$add('Vorlage .env.example vorhanden', is_file($root.'/.env.example'), '');
$add('HTTPS', ! empty($_SERVER['HTTPS']) || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https', 'Empfohlen (Mikrofon, Cookies, Sicherheit).', false);

$blocked = (bool) array_filter($checks, fn ($c) => ! $c['ok'] && $c['blocking']);

// ---------------------------------------------------------------- Installationsschlüssel
if (! $keyExists && ! $blocked) {
    @mkdir(dirname($keyFile), 0775, true);
    file_put_contents($keyFile, bin2hex(random_bytes(10)));
    @chmod($keyFile, 0640);
}

if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

$scheme = (! empty($_SERVER['HTTPS']) || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') ? 'https' : 'http';
$defaults = [
    'app_name' => 'Vylaris AI', 'app_url' => $scheme.'://'.($_SERVER['HTTP_HOST'] ?? 'localhost'),
    'db_driver' => 'sqlite', 'db_host' => '127.0.0.1', 'db_port' => '3306', 'db_name' => '', 'db_user' => '', 'db_pass' => '',
    'queue' => 'sync', 'mail_host' => '', 'mail_port' => '587', 'mail_user' => '', 'mail_pass' => '', 'mail_enc' => 'tls', 'mail_from' => '',
    'admin_name' => 'Administrator', 'admin_email' => '', 'admin_pass' => '', 'admin_pass2' => '', 'install_key' => '',
];
$input = $defaults;
$errors = [];
$log = [];

// ---------------------------------------------------------------- Installation ausführen
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ! $blocked) {
    foreach ($defaults as $k => $_) {
        $input[$k] = trim((string) ($_POST[$k] ?? $defaults[$k]));
    }

    if (! hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''))) {
        $errors[] = 'Ungültiges Formular-Token. Bitte Seite neu laden.';
    }

    $storedKey = is_file($keyFile) ? trim((string) file_get_contents($keyFile)) : '';

    if ($storedKey === '' || ! hash_equals($storedKey, $input['install_key'])) {
        usleep(800000);
        $errors[] = 'Der Installationsschlüssel ist falsch.';
    }

    if ($input['app_name'] === '' || mb_strlen($input['app_name']) > 60) {
        $errors[] = 'Bitte einen Plattformnamen (max. 60 Zeichen) angeben.';
    }

    if (! filter_var($input['app_url'], FILTER_VALIDATE_URL) || ! preg_match('#^https?://#', $input['app_url'])) {
        $errors[] = 'Die URL muss mit http:// oder https:// beginnen.';
    }

    if (! in_array($input['db_driver'], ['sqlite', 'mysql'], true) || ($input['db_driver'] === 'sqlite' && ! extension_loaded('pdo_sqlite')) || ($input['db_driver'] === 'mysql' && ! extension_loaded('pdo_mysql'))) {
        $errors[] = 'Der gewählte Datenbanktyp ist auf diesem Server nicht verfügbar.';
    }

    if ($input['db_driver'] === 'mysql' && ($input['db_host'] === '' || $input['db_name'] === '' || $input['db_user'] === '' || ! ctype_digit($input['db_port']))) {
        $errors[] = 'Bitte Host, Port, Datenbankname und Benutzer der MySQL-Datenbank angeben.';
    }

    if (! filter_var($input['admin_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Bitte eine gültige Administrator-E-Mail angeben.';
    }

    if ($input['admin_name'] === '') {
        $errors[] = 'Bitte einen Administrator-Namen angeben.';
    }

    if (mb_strlen($input['admin_pass']) < 10) {
        $errors[] = 'Das Administrator-Passwort muss mindestens 10 Zeichen lang sein.';
    }

    if ($input['admin_pass'] !== $input['admin_pass2']) {
        $errors[] = 'Die Passwörter stimmen nicht überein.';
    }

    if ($input['mail_host'] !== '' && (! ctype_digit($input['mail_port']) || ! filter_var($input['mail_from'], FILTER_VALIDATE_EMAIL))) {
        $errors[] = 'Für den E-Mail-Versand werden Port und eine gültige Absenderadresse benötigt.';
    }

    foreach (['app_name', 'app_url', 'db_host', 'db_name', 'db_user', 'db_pass', 'mail_host', 'mail_user', 'mail_pass', 'mail_from'] as $field) {
        if (preg_match('/[\r\n\0]/', $input[$field])) {
            $errors[] = 'Ungültige Zeichen in einem Feld.';
            break;
        }
    }

    // Datenbankverbindung vorab testen
    if (! $errors && $input['db_driver'] === 'mysql') {
        try {
            new PDO("mysql:host={$input['db_host']};port={$input['db_port']};dbname={$input['db_name']};charset=utf8mb4", $input['db_user'], $input['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 8]);
        } catch (PDOException $e) {
            $errors[] = 'Datenbankverbindung fehlgeschlagen: '.preg_replace('/\s+/', ' ', $e->getMessage());
        }
    }

    if (! $errors) {
        try {
            $values = [
                'APP_NAME' => $input['app_name'], 'APP_ENV' => 'production', 'APP_DEBUG' => 'false', 'APP_URL' => rtrim($input['app_url'], '/'),
                'LOG_LEVEL' => 'warning', 'QUEUE_CONNECTION' => $input['queue'] === 'database' ? 'database' : 'sync',
                'SESSION_SECURE_COOKIE' => str_starts_with($input['app_url'], 'https://') ? 'true' : 'false',
                'VITE_APP_NAME' => '${APP_NAME}',
            ];

            if (envValue($envFile, 'APP_KEY') === '') {
                $values['APP_KEY'] = 'base64:'.base64_encode(random_bytes(32));
            }

            if ($input['db_driver'] === 'sqlite') {
                $sqlite = $root.'/database/database.sqlite';
                touch($sqlite);
                $values += ['DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $sqlite];
            } else {
                $values += ['DB_CONNECTION' => 'mysql', 'DB_HOST' => $input['db_host'], 'DB_PORT' => $input['db_port'], 'DB_DATABASE' => $input['db_name'], 'DB_USERNAME' => $input['db_user'], 'DB_PASSWORD' => $input['db_pass']];
            }

            if ($input['mail_host'] !== '') {
                $values += [
                    'MAIL_MAILER' => 'smtp', 'MAIL_HOST' => $input['mail_host'], 'MAIL_PORT' => $input['mail_port'], 'MAIL_USERNAME' => $input['mail_user'], 'MAIL_PASSWORD' => $input['mail_pass'],
                    'MAIL_SCHEME' => $input['mail_enc'] === 'ssl' ? 'smtps' : 'smtp', 'MAIL_FROM_ADDRESS' => $input['mail_from'], 'MAIL_FROM_NAME' => '${APP_NAME}',
                ];
            }

            writeEnv($envFile, (string) file_get_contents($root.'/.env.example'), $values);
            $log[] = '.env geschrieben (APP_KEY erzeugt).';

            @unlink($root.'/bootstrap/cache/config.php');

            define('LARAVEL_START', microtime(true));
            require $root.'/vendor/autoload.php';
            $app = require $root.'/bootstrap/app.php';
            $kernel = $app->make(Kernel::class);
            $kernel->bootstrap();

            $kernel->call('migrate', ['--force' => true]);
            $log[] = 'Datenbank-Migrationen ausgeführt.';

            $kernel->call('vylaris:make-admin', ['email' => $input['admin_email'], '--name' => $input['admin_name'], '--password' => $input['admin_pass']]);
            $log[] = 'Rollen, Funktionskatalog und Administrator angelegt.';

            $kernel->call('config:clear');

            file_put_contents($lockFile, date('c')."\n");
            @unlink($keyFile);
            $log[] = 'Installer gesperrt.';

            $removed = @unlink(__FILE__);
            $_SESSION = [];
            session_destroy();

            $next = '<ul>'.implode('', array_map(fn ($l) => '<li><span>'.h($l).'</span><span class="ok">✓</span></li>', $log)).'</ul>'
                .'<h2>Wichtige nächste Schritte</h2><ol>'
                .'<li>'.($removed ? '<code>install.php</code> wurde automatisch gelöscht.' : '<strong class="warn">Bitte lösche <code>public/install.php</code> manuell.</strong>').'</li>'
                .'<li>Melde dich an und richte unter <em>Admin → Provider &amp; Modelle</em> einen KI-Anbieter mit API-Schlüssel ein.</li>'
                .($input['queue'] === 'sync' ? '<li>Hintergrundjobs laufen synchron. Für bessere Performance später <code>QUEUE_CONNECTION=database</code> setzen und <code>php artisan queue:work</code> betreiben.</li>' : '<li>Starte den Queue-Worker: <code>php artisan queue:work --tries=2</code>.</li>')
                .'<li>Richte den Cronjob ein: <code>* * * * * php '.h($root).'/artisan schedule:run</code></li>'
                .($input['mail_host'] === '' ? '<li class="warn">E-Mail-Versand ist nicht konfiguriert (Mails werden nur ins Log geschrieben). Setze <code>MAIL_*</code> in der <code>.env</code>, damit Verifizierung und Passwort-Reset funktionieren.</li>' : '')
                .'</ol><a class="btn" href="'.h(rtrim($input['app_url'], '/')).'/login">Zum Login</a>';

            page('Installation abgeschlossen', '<div class="card"><h2 style="margin-top:0">✓ Installation abgeschlossen</h2>'.$next.'</div>');
        } catch (Throwable $e) {
            $errors[] = 'Die Installation ist fehlgeschlagen: '.preg_replace('/\s+/', ' ', mb_substr($e->getMessage(), 0, 400));
            $errors[] = 'Bereits ausgeführte Schritte: '.($log ? implode(' ', $log) : 'keine').' – Nach Behebung der Ursache kannst du den Installer erneut ausführen.';
        }
    }
}

// ---------------------------------------------------------------- Formular
$out = '<p style="color:var(--mut)">Dieser Assistent richtet die Plattform in wenigen Schritten ein.</p>';
$out .= '<div class="card"><h2 style="margin-top:0">1. Systemprüfung</h2><ul>';

foreach ($checks as $c) {
    $cls = $c['ok'] ? 'ok' : ($c['blocking'] ? 'err' : 'warn');
    $out .= '<li><span>'.h($c['name']).'</span><span class="'.$cls.'">'.($c['ok'] ? '✓' : '✗').' '.h($c['detail']).'</span></li>';
}

$out .= '</ul></div>';

if ($blocked) {
    $out .= '<div class="alert">Bitte behebe die markierten Punkte und lade die Seite neu.</div>';
    page('Installation', $out);
}

foreach ($errors as $e) {
    $out .= '<div class="alert">'.h($e).'</div>';
}

$f = fn (string $k) => h($input[$k]);
$sel = fn (string $k, string $v) => $input[$k] === $v ? ' selected' : '';

$out .= '<form method="post" autocomplete="off" class="card"><input type="hidden" name="csrf" value="'.h($_SESSION['csrf']).'">'
    .'<h2 style="margin-top:0">2. Sicherheit</h2>'
    .'<label for="install_key">Installationsschlüssel</label><input id="install_key" name="install_key" value="'.$f('install_key').'" required>'
    .'<small>Verhindert, dass Fremde die Installation übernehmen. Den Schlüssel findest du in der Datei <code>storage/app/install-key.txt</code> (per FTP/Dateimanager/SSH).</small>'
    .'<h2>3. Plattform</h2><div class="row"><div><label for="app_name">Name</label><input id="app_name" name="app_name" value="'.$f('app_name').'" required></div>'
    .'<div><label for="app_url">URL</label><input id="app_url" name="app_url" value="'.$f('app_url').'" required></div></div>'
    .'<h2>4. Datenbank</h2><label for="db_driver">Typ</label><select id="db_driver" name="db_driver"><option value="sqlite"'.$sel('db_driver', 'sqlite').'>SQLite (einfach, keine Einrichtung)</option><option value="mysql"'.$sel('db_driver', 'mysql').'>MySQL / MariaDB</option></select>'
    .'<small>Für MySQL die Datenbank vorher anlegen. Felder bei SQLite werden ignoriert.</small>'
    .'<div class="row"><div><label for="db_host">Host</label><input id="db_host" name="db_host" value="'.$f('db_host').'"></div><div><label for="db_port">Port</label><input id="db_port" name="db_port" value="'.$f('db_port').'"></div></div>'
    .'<div class="row"><div><label for="db_name">Datenbankname</label><input id="db_name" name="db_name" value="'.$f('db_name').'"></div><div><label for="db_user">Benutzer</label><input id="db_user" name="db_user" value="'.$f('db_user').'"></div></div>'
    .'<label for="db_pass">Passwort</label><input id="db_pass" type="password" name="db_pass" autocomplete="new-password">'
    .'<h2>5. Hintergrundjobs</h2><select name="queue" aria-label="Queue"><option value="sync"'.$sel('queue', 'sync').'>Synchron (läuft ohne Worker, ideal für Shared Hosting)</option><option value="database"'.$sel('queue', 'database').'>Datenbank-Queue (Worker erforderlich, empfohlen für Produktion)</option></select>'
    .'<h2>6. E-Mail <span style="font-weight:400;color:var(--mut)">(optional)</span></h2><small>Für Verifizierung, Passwort-Reset und Export. Leer lassen = später in der .env setzen.</small>'
    .'<div class="row"><div><label for="mail_host">SMTP-Host</label><input id="mail_host" name="mail_host" value="'.$f('mail_host').'"></div><div><label for="mail_port">Port</label><input id="mail_port" name="mail_port" value="'.$f('mail_port').'"></div></div>'
    .'<div class="row"><div><label for="mail_user">Benutzer</label><input id="mail_user" name="mail_user" value="'.$f('mail_user').'"></div><div><label for="mail_pass">Passwort</label><input id="mail_pass" type="password" name="mail_pass" autocomplete="new-password"></div></div>'
    .'<div class="row"><div><label for="mail_enc">Verschlüsselung</label><select id="mail_enc" name="mail_enc"><option value="tls"'.$sel('mail_enc', 'tls').'>STARTTLS (587)</option><option value="ssl"'.$sel('mail_enc', 'ssl').'>SSL/TLS (465)</option></select></div><div><label for="mail_from">Absenderadresse</label><input id="mail_from" type="email" name="mail_from" value="'.$f('mail_from').'"></div></div>'
    .'<h2>7. Administrator</h2><div class="row"><div><label for="admin_name">Name</label><input id="admin_name" name="admin_name" value="'.$f('admin_name').'" required></div><div><label for="admin_email">E-Mail</label><input id="admin_email" type="email" name="admin_email" value="'.$f('admin_email').'" required></div></div>'
    .'<div class="row"><div><label for="admin_pass">Passwort (min. 10 Zeichen)</label><input id="admin_pass" type="password" name="admin_pass" minlength="10" required autocomplete="new-password"></div><div><label for="admin_pass2">Wiederholen</label><input id="admin_pass2" type="password" name="admin_pass2" minlength="10" required autocomplete="new-password"></div></div>'
    .'<button type="submit">Jetzt installieren</button></form>';

page('Installation', $out);
