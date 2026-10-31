<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class UserFile extends Model
{
    use HasFactory;

    protected $table = 'files';

    protected $guarded = [];

    protected $hidden = ['extracted_text'];

    protected function casts(): array
    {
        return ['in_knowledge_base' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(KnowledgeChunk::class, 'file_id');
    }

    public function contents(): string
    {
        return Storage::disk($this->disk)->get($this->path);
    }

    protected static function booted(): void
    {
        static::deleting(function (UserFile $file) {
            Storage::disk($file->disk)->delete($file->path);
        });
    }
}
