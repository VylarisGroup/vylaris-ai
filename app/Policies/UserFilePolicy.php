<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserFile;

/**
 * Strikte Datentrennung: Zugriff nur auf eigene Datensätze.
 */
class UserFilePolicy
{
    public function view(User $user, UserFile $model): bool
    {
        return $user->is_active && $model->user_id === $user->id;
    }

    public function update(User $user, UserFile $model): bool
    {
        return $this->view($user, $model);
    }

    public function delete(User $user, UserFile $model): bool
    {
        return $this->view($user, $model);
    }
}
