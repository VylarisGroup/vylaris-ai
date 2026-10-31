<?php

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;

/**
 * Strikte Datentrennung: Zugriff nur auf eigene Datensätze.
 */
class ChatPolicy
{
    public function view(User $user, Chat $model): bool
    {
        return $user->is_active && $model->user_id === $user->id;
    }

    public function update(User $user, Chat $model): bool
    {
        return $this->view($user, $model);
    }

    public function delete(User $user, Chat $model): bool
    {
        return $this->view($user, $model);
    }
}
