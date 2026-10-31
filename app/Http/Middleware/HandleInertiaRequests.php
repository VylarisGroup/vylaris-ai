<?php

namespace App\Http\Middleware;

use App\Services\Features\FeatureManager;
use App\Services\SettingsService;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(SettingsService::class);
        $user = $request->user();

        return [
            ...parent::share($request),
            'app' => ['name' => $settings->get('site_name', 'Vylaris AI')],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified' => $user->hasVerifiedEmail(),
                    'role' => $user->role?->name,
                    'is_admin' => $user->isAdmin(),
                    'permissions' => collect(array_keys(Permissions::all()))->filter(fn ($p) => $user->hasPermission($p))->values(),
                    'preferences' => $user->preferences ?? (object) [],
                ] : null,
            ],
            'features' => fn () => $user ? collect(['streaming', 'files', 'web_search', 'stt', 'tts', 'image_generation', 'memory', 'rag', 'agents', 'documents'])
                ->mapWithKeys(fn ($key) => [$key => app(FeatureManager::class)->status($key, $user)])
                ->all() : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'oauth' => fn () => [
                'google' => (bool) $settings->get('oauth_google_client_id') && (bool) $settings->get('oauth_google_client_secret'),
                'github' => (bool) $settings->get('oauth_github_client_id') && (bool) $settings->get('oauth_github_client_secret'),
            ],
        ];
    }
}
