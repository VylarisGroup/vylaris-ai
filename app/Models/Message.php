<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Message extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'sources' => 'array',
            'tool_events' => 'array',
            'generated' => 'array',
            'cost' => 'float',
        ];
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class, 'ai_model_id');
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(UserFile::class, 'file_message', 'message_id', 'file_id');
    }
}
