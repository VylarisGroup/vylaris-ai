<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role_id', 'is_active', 'custom_instructions', 'about_me', 'preferences', 'limit_overrides', 'stripe_customer_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /** @var array<string, mixed> */
    protected $attributes = ['is_active' => true];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'preferences' => 'array',
            'limit_overrides' => 'array',
            'last_seen_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(UserFile::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Aktuell gültiges Abo (neuestes mit freigeschaltetem Status und nicht abgelaufener Laufzeit).
     */
    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->with('plan')
            ->whereIn('status', Subscription::ENTITLED)
            ->latest('id')
            ->get()
            ->first(fn (Subscription $s) => $s->isEntitled());
    }

    /**
     * Wirksamer Plan: bezahltes Abo, sonst der als Standard markierte Gratis-Plan, sonst null.
     */
    public function currentPlan(): ?Plan
    {
        return $this->activeSubscription()?->plan
            ?? Plan::query()->where('is_default', true)->where('is_active', true)->first();
    }

    public function memories(): HasMany
    {
        return $this->hasMany(Memory::class);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->is_active && $this->role?->hasPermission($permission) === true;
    }

    public function isAdmin(): bool
    {
        return $this->hasPermission('admin.access');
    }

    /**
     * Wirksames Limit (Benutzer-Override vor Rollen-Limit); null = unbegrenzt.
     */
    public function limit(string $key): ?int
    {
        $override = $this->limit_overrides[$key] ?? null;

        if ($override !== null && $override !== '') {
            return (int) $override;
        }

        $fromPlan = $this->currentPlan()?->limitFor($key);

        if ($fromPlan !== null) {
            return $fromPlan < 0 ? null : $fromPlan;
        }

        $value = $this->role?->limits[$key] ?? null;

        return $value === null || $value === '' ? null : (int) $value;
    }

    public function preference(string $key, mixed $default = null): mixed
    {
        return data_get($this->preferences ?? [], $key, $default);
    }
}
