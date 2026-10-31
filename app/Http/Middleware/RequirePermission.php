<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        foreach ($permissions as $permission) {
            if (! $user || ! $user->hasPermission($permission)) {
                abort(403, 'Keine Berechtigung.');
            }
        }

        return $next($request);
    }
}
