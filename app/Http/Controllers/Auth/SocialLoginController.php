<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

/**
 * Optionaler OAuth-Login (Google, GitHub). Zugangsdaten werden im Admin-Dashboard gepflegt.
 */
class SocialLoginController extends Controller
{
    private const PROVIDERS = ['google', 'github'];

    private function configure(string $provider, SettingsService $settings): void
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);

        $id = $settings->get("oauth_{$provider}_client_id");
        $secret = $settings->get("oauth_{$provider}_client_secret");
        abort_unless($id && $secret, 404, 'Dieser Login ist nicht konfiguriert.');

        config(["services.{$provider}" => [
            'client_id' => $id,
            'client_secret' => $secret,
            'redirect' => route('oauth.callback', $provider),
        ]]);
    }

    public function redirect(string $provider, SettingsService $settings): RedirectResponse
    {
        $this->configure($provider, $settings);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider, SettingsService $settings): RedirectResponse
    {
        $this->configure($provider, $settings);

        try {
            $social = Socialite::driver($provider)->user();
        } catch (\Throwable) {
            return redirect()->route('login')->withErrors(['email' => 'Anmeldung über '.ucfirst($provider).' fehlgeschlagen.']);
        }

        $account = SocialAccount::where('provider', $provider)->where('provider_user_id', $social->getId())->first();

        if ($account) {
            $user = User::find($account->user_id);
        } else {
            $email = strtolower((string) $social->getEmail());

            if ($email === '') {
                return redirect()->route('login')->withErrors(['email' => 'Der Anbieter hat keine E-Mail-Adresse geliefert.']);
            }

            if (User::where('email', $email)->exists()) {
                return redirect()->route('login')->withErrors(['email' => 'Für diese E-Mail existiert bereits ein Konto. Bitte mit Passwort anmelden und dort verknüpfen.']);
            }

            if (! $settings->get('registration_enabled', true)) {
                return redirect()->route('login')->withErrors(['email' => 'Die Registrierung ist deaktiviert.']);
            }

            $user = User::create([
                'name' => $social->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'password' => Str::random(40),
            ]);

            // Nur Google liefert verlässlich verifizierte Adressen.
            if ($provider === 'google') {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            SocialAccount::create(['user_id' => $user->id, 'provider' => $provider, 'provider_user_id' => $social->getId()]);
        }

        if (! $user || ! $user->is_active) {
            return redirect()->route('login')->withErrors(['email' => 'Dieses Konto ist deaktiviert.']);
        }

        Auth::login($user, true);

        return redirect()->intended(route('chat.index'));
    }
}
