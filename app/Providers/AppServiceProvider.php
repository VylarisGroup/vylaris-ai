<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\User;
use App\Services\Features\FeatureManager;
use App\Services\SettingsService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SettingsService::class);
        $this->app->singleton(FeatureManager::class);
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Neue Benutzer erhalten die Standardrolle; der allererste Benutzer wird Administrator.
        User::creating(function (User $user) {
            if ($user->role_id === null) {
                $slug = User::query()->doesntExist() ? 'admin' : null;
                $user->role_id = $slug
                    ? Role::where('slug', $slug)->value('id')
                    : Role::where('is_default', true)->value('id');
            }
        });

        RateLimiter::for('chat', fn (Request $r) => Limit::perMinute(30)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('uploads', fn (Request $r) => Limit::perMinute(20)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('voice', fn (Request $r) => Limit::perMinute(40)->by($r->user()?->id ?: $r->ip()));
        RateLimiter::for('api-admin', fn (Request $r) => Limit::perMinute(120)->by($r->user()?->id ?: $r->ip()));
    }
}
