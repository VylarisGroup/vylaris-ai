<?php

namespace App\Services\Tools;

use App\Models\Chat;
use App\Models\User;

class ToolContext
{
    public function __construct(public readonly User $user, public readonly ?Chat $chat = null) {}
}
