<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Closure;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerifiedWhenRequired
{
    public function __construct(private SettingsService $settings) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($this->settings->get('require_email_verification', true)
            && $user instanceof MustVerifyEmail
            && ! $user->hasVerifiedEmail()) {
            return $request->expectsJson()
                ? abort(403, 'Ihre E-Mail-Adresse ist nicht verifiziert.')
                : Redirect::route('verification.notice');
        }

        return $next($request);
    }
}
