<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    protected $guarded = [];

    protected $hidden = ['api_key', 'extra_headers'];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'extra_headers' => 'encrypted:array',
            'is_enabled' => 'boolean',
            'is_fallback' => 'boolean',
        ];
    }

    public function models(): HasMany
    {
        return $this->hasMany(AiModel::class);
    }
}
