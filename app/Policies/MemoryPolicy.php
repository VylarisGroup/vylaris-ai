<?php

namespace App\Policies;

use App\Models\Memory;
use App\Models\User;

/**
 * Strikte Datentrennung: Zugriff nur auf eigene Datensätze.
 */
class MemoryPolicy
{
    public function view(User $user, Memory $model): bool
    {
        return $user->is_active && $model->user_id === $user->id;
    }

    public function update(User $user, Memory $model): bool
    {
        return $this->view($user, $model);
    }

    public function delete(User $user, Memory $model): bool
    {
        return $this->view($user, $model);
    }
}
