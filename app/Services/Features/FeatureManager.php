<?php

namespace App\Services\Features;

use App\Models\AiModel;
use App\Models\Feature;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;

/**
 * Zentraler Zugriff auf dynamisch konfigurierbare Funktionen (Features).
 */
class FeatureManager
{
    /** @var Collection<string, Feature>|null */
    private ?Collection $features = null;

    /**
     * Konfigurationsschlüssel, die verschlüsselt gespeichert werden.
     *
     * @var array<int, string>
     */
    public const SECRET_KEYS = ['api_key'];

    /**
     * @return Collection<string, Feature>
     */
    public function all(): Collection
    {
        return $this->features ??= Feature::with(['roles', 'model.provider', 'model.capabilities'])->get()->keyBy('key');
    }

    public function flush(): void
    {
        $this->features = null;
    }

    public function find(string $key): ?Feature
    {
        return $this->all()->get($key);
    }

    public function enabled(string $key, ?User $user = null): bool
    {
        $feature = $this->find($key);

        return $feature !== null && $feature->availableTo($user ?? auth()->user());
    }

    public function model(string $key): ?AiModel
    {
        $model = $this->find($key)?->model;

        return $model && $model->is_enabled && $model->provider?->is_enabled ? $model : null;
    }

    /**
     * Konfiguration mit entschlüsselten Geheimnissen (nur serverseitig verwenden).
     *
     * @return array<string, mixed>
     */
    public function config(string $key): array
    {
        $config = $this->find($key)?->config ?? [];

        foreach (self::SECRET_KEYS as $secretKey) {
            if (! empty($config[$secretKey])) {
                try {
                    $config[$secretKey] = Crypt::decryptString($config[$secretKey]);
                } catch (\Throwable) {
                    $config[$secretKey] = '';
                }
            }
        }

        return $config;
    }

    /**
     * Konfiguration für das Admin-Frontend (Geheimnisse maskiert).
     *
     * @return array<string, mixed>
     */
    public function maskedConfig(Feature $feature): array
    {
        $config = $feature->config ?? [];

        foreach (self::SECRET_KEYS as $secretKey) {
            if (! empty($config[$secretKey])) {
                $config[$secretKey] = '********';
            }
        }

        return $config;
    }

    /**
     * @param  array<string, mixed>  $incoming
     * @return array<string, mixed>
     */
    public function prepareConfigForStorage(Feature $feature, array $incoming): array
    {
        $existing = $feature->config ?? [];

        foreach (self::SECRET_KEYS as $secretKey) {
            $value = $incoming[$secretKey] ?? null;

            if ($value === '********' || $value === null) {
                if (isset($existing[$secretKey])) {
                    $incoming[$secretKey] = $existing[$secretKey];
                } else {
                    unset($incoming[$secretKey]);
                }
            } elseif ($value === '') {
                unset($incoming[$secretKey]);
            } else {
                $incoming[$secretKey] = Crypt::encryptString($value);
            }
        }

        return $incoming;
    }

    /**
     * Status für die Oberfläche: aktiv, konfiguriert, Grund bei Nichtverfügbarkeit.
     *
     * @return array{enabled: bool, configured: bool, reason: ?string}
     */
    public function status(string $key, ?User $user = null): array
    {
        $feature = $this->find($key);

        if (! $feature || ! $feature->is_enabled) {
            return ['enabled' => false, 'configured' => false, 'reason' => 'Vom Administrator deaktiviert.'];
        }

        if (! $feature->availableTo($user ?? auth()->user())) {
            return ['enabled' => false, 'configured' => false, 'reason' => 'Für Ihre Rolle nicht freigegeben.'];
        }

        $needsModel = in_array($key, ['stt', 'tts', 'image_generation'], true);

        if ($needsModel && ! $this->model($key)) {
            return ['enabled' => true, 'configured' => false, 'reason' => 'Kein Modell mit passender Capability zugewiesen.'];
        }

        if ($key === 'web_search') {
            $config = $this->config('web_search');

            if (empty($config['driver']) || ($config['driver'] !== 'searxng' && empty($config['api_key'])) || ($config['driver'] === 'searxng' && empty($config['base_url']))) {
                return ['enabled' => true, 'configured' => false, 'reason' => 'Suchanbieter nicht konfiguriert.'];
            }
        }

        return ['enabled' => true, 'configured' => true, 'reason' => null];
    }
}
