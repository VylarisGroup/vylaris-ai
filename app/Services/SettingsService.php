<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;

/**
 * Persistente Plattform-Einstellungen (Datenbank, mit Cache). Geheime Werte werden verschlüsselt gespeichert.
 */
class SettingsService
{
    /**
     * @return array<string, array{label: string, type: string, default: mixed, secret?: bool, group: string}>
     */
    public static function definitions(): array
    {
        return [
            'site_name' => ['label' => 'Plattformname', 'type' => 'string', 'default' => 'Vylaris AI', 'group' => 'Allgemein'],
            'registration_enabled' => ['label' => 'Registrierung erlauben', 'type' => 'bool', 'default' => true, 'group' => 'Allgemein'],
            'require_email_verification' => ['label' => 'E-Mail-Verifizierung verlangen', 'type' => 'bool', 'default' => true, 'group' => 'Allgemein'],
            'global_instructions' => ['label' => 'Globale KI-Instructions', 'type' => 'text', 'default' => '', 'group' => 'KI'],
            'default_model_strategy' => ['label' => 'Automatische Modellauswahl aktiv', 'type' => 'bool', 'default' => true, 'group' => 'KI'],
            'max_fallback_attempts' => ['label' => 'Maximale Fallback-Versuche', 'type' => 'int', 'default' => 2, 'group' => 'KI'],
            'title_generation' => ['label' => 'Chat-Titel automatisch erzeugen', 'type' => 'bool', 'default' => true, 'group' => 'KI'],
            'log_retention_days' => ['label' => 'Aufbewahrung von Logs (Tage)', 'type' => 'int', 'default' => 90, 'group' => 'Datenschutz'],
            'privacy_contact' => ['label' => 'Datenschutz-Kontakt (E-Mail)', 'type' => 'string', 'default' => '', 'group' => 'Datenschutz'],
            'oauth_google_client_id' => ['label' => 'Google OAuth Client-ID', 'type' => 'string', 'default' => '', 'group' => 'OAuth'],
            'oauth_google_client_secret' => ['label' => 'Google OAuth Client-Secret', 'type' => 'string', 'default' => '', 'secret' => true, 'group' => 'OAuth'],
            'oauth_github_client_id' => ['label' => 'GitHub OAuth Client-ID', 'type' => 'string', 'default' => '', 'group' => 'OAuth'],
            'oauth_github_client_secret' => ['label' => 'GitHub OAuth Client-Secret', 'type' => 'string', 'default' => '', 'secret' => true, 'group' => 'OAuth'],
        ];
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $all = $this->all();

        if (array_key_exists($key, $all)) {
            return $all[$key];
        }

        return $default ?? (self::definitions()[$key]['default'] ?? null);
    }

    public function set(string $key, mixed $value): void
    {
        $definition = self::definitions()[$key] ?? null;
        $secret = $definition['secret'] ?? false;

        $stored = is_bool($value) ? ($value ? '1' : '0') : (string) ($value ?? '');

        if ($secret && $stored !== '') {
            $stored = Crypt::encryptString($stored);
        }

        Setting::updateOrCreate(['key' => $key], ['value' => $stored, 'is_secret' => $secret]);
        Cache::forget('settings.all');
    }

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        return Cache::remember('settings.all', 300, function () {
            if (! Schema::hasTable('settings')) {
                return [];
            }

            $result = [];
            $definitions = self::definitions();

            foreach (Setting::all() as $setting) {
                $value = $setting->value;

                if ($setting->is_secret && $value) {
                    try {
                        $value = Crypt::decryptString($value);
                    } catch (\Throwable) {
                        $value = '';
                    }
                }

                $result[$setting->key] = match ($definitions[$setting->key]['type'] ?? 'string') {
                    'bool' => $value === '1',
                    'int' => (int) $value,
                    default => $value,
                };
            }

            return $result;
        });
    }

    /**
     * Werte für die Admin-Oberfläche; Geheimnisse werden maskiert.
     *
     * @return array<string, mixed>
     */
    public function forAdmin(): array
    {
        $values = [];

        foreach (self::definitions() as $key => $definition) {
            $value = $this->get($key);
            $values[$key] = ($definition['secret'] ?? false) ? ($value ? '********' : '') : $value;
        }

        return $values;
    }
}
