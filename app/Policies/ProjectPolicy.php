<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

/**
 * Strikte Datentrennung: Zugriff nur auf eigene Datensätze.
 */
class ProjectPolicy
{
    public function view(User $user, Project $model): bool
    {
        return $user->is_active && $model->user_id === $user->id;
    }

    public function update(User $user, Project $model): bool
    {
        return $this->view($user, $model);
    }

    public function delete(User $user, Project $model): bool
    {
        return $this->view($user, $model);
    }
}
