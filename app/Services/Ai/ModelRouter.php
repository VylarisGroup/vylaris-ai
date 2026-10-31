<?php

namespace App\Services\Ai;

use App\Models\AiModel;
use App\Services\SettingsService;
use Illuminate\Support\Collection;

/**
 * Modellauswahl: manuelle Wahl, automatische Auswahl nach Aufgabe und Capability-Prüfung.
 */
class ModelRouter
{
    public function __construct(private SettingsService $settings) {}

    /**
     * @return Collection<int, AiModel>
     */
    public function chatModels(): Collection
    {
        return AiModel::query()
            ->with(['provider', 'capabilities'])
            ->where('is_enabled', true)
            ->whereHas('provider', fn ($q) => $q->where('is_enabled', true))
            ->whereHas('capabilities', fn ($q) => $q->where('capability', 'chat'))
            ->orderBy('sort')
            ->orderBy('display_name')
            ->get();
    }

    /**
     * @param  array{vision?: bool, tools?: bool}  $needs
     * @return array{model: ?AiModel, notice: ?string}
     */
    public function resolve(?AiModel $selected, array $needs, string $prompt): array
    {
        $models = $this->chatModels();
        $needsVision = $needs['vision'] ?? false;

        if ($selected) {
            $selected = $models->firstWhere('id', $selected->id);
        }

        if ($selected && (! $needsVision || $selected->hasCapability('vision'))) {
            return ['model' => $selected, 'notice' => null];
        }

        $pool = $needsVision ? $models->filter(fn (AiModel $m) => $m->hasCapability('vision')) : $models;

        if ($pool->isEmpty()) {
            return ['model' => null, 'notice' => $needsVision ? 'Kein Modell mit Bildanalyse (Vision) verfügbar.' : null];
        }

        $notice = null;

        if ($selected && $needsVision) {
            $notice = "Das gewählte Modell unterstützt keine Bilder; automatisch gewechselt zu {$pool->first()->display_name}.";
        }

        if (! $selected && ! $this->settings->get('default_model_strategy', true) && ($default = $pool->firstWhere('is_default', true))) {
            return ['model' => $default, 'notice' => null];
        }

        $tier = $this->tierFor($prompt);
        $match = $pool->firstWhere('tier', $tier) ?? $pool->firstWhere('is_default', true) ?? $pool->first();

        if ($pool->firstWhere('is_default', true) && $pool->where('tier', $tier)->isEmpty()) {
            $match = $pool->firstWhere('is_default', true);
        }

        return ['model' => $match, 'notice' => $notice];
    }

    public function tierFor(string $prompt): string
    {
        $length = mb_strlen($prompt);

        if ($length > 1500 || preg_match('/```|\b(analysiere|beweise|refactor|architektur|algorithm|debug|optimiere|analy[sz]e|prove)\b/iu', $prompt)) {
            return 'strong';
        }

        return $length < 160 ? 'fast' : 'balanced';
    }
}
