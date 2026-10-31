<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(SettingsService $settings): Response
    {
        return Inertia::render('Admin/Settings', [
            'definitions' => collect(SettingsService::definitions())->map(fn ($d, $key) => ['key' => $key] + collect($d)->except('default')->all())->values(),
            'values' => $settings->forAdmin(),
        ]);
    }

    public function update(Request $request, SettingsService $settings): RedirectResponse
    {
        $definitions = SettingsService::definitions();
        $input = $request->input('values', []);
        $changed = [];

        foreach ($definitions as $key => $definition) {
            if (! array_key_exists($key, $input)) {
                continue;
            }

            $value = $input[$key];

            if (($definition['secret'] ?? false) && $value === '********') {
                continue;
            }

            $value = match ($definition['type']) {
                'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'int' => max(0, (int) $value),
                default => is_string($value) ? mb_substr($value, 0, $definition['type'] === 'text' ? 10000 : 500) : '',
            };

            if ($key === 'privacy_contact' && $value !== '' && ! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return back()->withErrors(['values.privacy_contact' => 'Ungültige E-Mail-Adresse.']);
            }

            $settings->set($key, $value);
            $changed[] = $key;
        }

        AuditService::log('settings.updated', null, ['keys' => $changed]);

        return back()->with('success', 'Einstellungen gespeichert.');
    }
}
