<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeChunk extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['embedding' => 'array'];
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(UserFile::class, 'file_id');
    }
}
