<?php

namespace App\Models;

use App\Enums\Capability;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiModel extends Model
{
    use HasFactory;

    protected $table = 'ai_models';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'allowed_parameters' => 'array',
            'is_enabled' => 'boolean',
            'is_default' => 'boolean',
            'price_input' => 'float',
            'price_output' => 'float',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function capabilities(): HasMany
    {
        return $this->hasMany(ModelCapability::class);
    }

    public function hasCapability(Capability|string $capability): bool
    {
        $key = $capability instanceof Capability ? $capability->value : $capability;

        if ($this->relationLoaded('capabilities')) {
            return $this->capabilities->contains('capability', $key);
        }

        return $this->capabilities()->where('capability', $key)->exists();
    }

    /**
     * @return array<string, mixed>
     */
    public function capabilityConfig(Capability|string $capability): array
    {
        $key = $capability instanceof Capability ? $capability->value : $capability;

        return $this->capabilities->firstWhere('capability', $key)?->config ?? [];
    }

    public function calculateCost(int $tokensIn, int $tokensOut): float
    {
        return ($tokensIn * $this->price_input + $tokensOut * $this->price_output) / 1_000_000;
    }
}
