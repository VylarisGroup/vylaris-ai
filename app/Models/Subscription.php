<?php

namespace App\Models;

use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    /** Status, in denen das Abo seine Leistungen freischaltet. */
    public const ENTITLED = ['active', 'trialing', 'past_due'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'current_period_end' => 'datetime',
            'canceled_at' => 'datetime',
            'cancel_at_period_end' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function isEntitled(): bool
    {
        if (! in_array($this->status, self::ENTITLED, true)) {
            return false;
        }

        return $this->current_period_end === null || $this->current_period_end->isFuture();
    }
}
