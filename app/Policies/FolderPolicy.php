<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;

/**
 * Strikte Datentrennung: Zugriff nur auf eigene Datensätze.
 */
class FolderPolicy
{
    public function view(User $user, Folder $model): bool
    {
        return $user->is_active && $model->user_id === $user->id;
    }

    public function update(User $user, Folder $model): bool
    {
        return $this->view($user, $model);
    }

    public function delete(User $user, Folder $model): bool
    {
        return $this->view($user, $model);
    }
}
