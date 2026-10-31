<?php

namespace App\Services\Features;

use App\Models\Message;
use App\Models\UsageLog;
use App\Models\User;
use App\Models\UserFile;

/**
 * Nutzungslimits pro Rolle bzw. Benutzer (Admin-konfigurierbar).
 */
class UsageLimiter
{
    /**
     * @throws \RuntimeException wenn ein Limit erreicht ist
     */
    public function assertCanSendMessage(User $user): void
    {
        if (($limit = $user->limit('messages_per_day')) !== null) {
            $count = Message::query()
                ->where('role', 'user')
                ->whereHas('chat', fn ($q) => $q->where('user_id', $user->id))
                ->where('created_at', '>=', now()->startOfDay())
                ->count();

            if ($count >= $limit) {
                throw new \RuntimeException("Tageslimit von {$limit} Nachrichten erreicht.");
            }
        }

        if (($limit = $user->limit('tokens_per_month')) !== null) {
            $tokens = (int) UsageLog::query()
                ->where('user_id', $user->id)
                ->where('created_at', '>=', now()->startOfMonth())
                ->selectRaw('COALESCE(SUM(tokens_in + tokens_out), 0) as total')
                ->value('total');

            if ($tokens >= $limit) {
                throw new \RuntimeException('Monatliches Token-Limit erreicht.');
            }
        }
    }

    public function assertCanUpload(User $user, int $count = 1): void
    {
        if (($limit = $user->limit('uploads_per_day')) === null) {
            return;
        }

        $uploaded = UserFile::query()
            ->where('user_id', $user->id)
            ->where('kind', '!=', 'generated')
            ->where('created_at', '>=', now()->startOfDay())
            ->count();

        if ($uploaded + $count > $limit) {
            throw new \RuntimeException("Tageslimit von {$limit} Datei-Uploads erreicht.");
        }
    }
}
