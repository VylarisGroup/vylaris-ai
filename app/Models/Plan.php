<?php

namespace App\Models;

use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'limits' => 'array',
            'allowed_tiers' => 'array',
            'highlights' => 'array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'is_featured' => 'boolean',
            'price_cents' => 'integer',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isFree(): bool
    {
        return $this->price_cents === 0;
    }

    /**
     * Wert eines Limits: null = vom Rollen-Limit erben, -1 = unbegrenzt.
     */
    public function limitFor(string $key): ?int
    {
        $value = $this->limits[$key] ?? null;

        return $value === null || $value === '' ? null : (int) $value;
    }

    public function allowsTier(?string $tier): bool
    {
        return empty($this->allowed_tiers) || in_array($tier, $this->allowed_tiers, true);
    }
}
