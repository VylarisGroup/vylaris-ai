<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    protected $guarded = [];

    protected $hidden = ['config_secret'];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
        ];
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class, 'ai_model_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function availableTo(?User $user): bool
    {
        if (! $this->is_enabled) {
            return false;
        }

        $roleIds = $this->relationLoaded('roles') ? $this->roles->pluck('id') : $this->roles()->pluck('roles.id');

        if ($roleIds->isEmpty()) {
            return true;
        }

        return $user !== null && $roleIds->contains($user->role_id);
    }
}
