<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function view(User $user, Message $message): bool
    {
        return $user->is_active && $message->chat()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Message $message): bool
    {
        return $this->view($user, $message);
    }

    public function delete(User $user, Message $message): bool
    {
        return $this->view($user, $message);
    }
}
