<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PreferencesController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Preferences', [
            'settings' => [
                'custom_instructions' => $user->custom_instructions,
                'about_me' => $user->about_me,
                'theme' => $user->preference('theme', 'system'),
                'voice' => $user->preference('voice', ['name' => null, 'speed' => 1.0, 'format' => 'mp3', 'language' => 'de', 'auto_read' => false]),
                'stt_language' => $user->preference('stt_language', 'de'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'custom_instructions' => ['nullable', 'string', 'max:5000'],
            'about_me' => ['nullable', 'string', 'max:2000'],
            'theme' => ['required', 'in:light,dark,system'],
            'voice.name' => ['nullable', 'string', 'max:80'],
            'voice.speed' => ['nullable', 'numeric', 'between:0.25,4'],
            'voice.format' => ['nullable', 'string', 'max:10'],
            'voice.language' => ['nullable', 'string', 'max:10'],
            'voice.auto_read' => ['nullable', 'boolean'],
            'stt_language' => ['nullable', 'string', 'max:10'],
        ]);

        $user = $request->user();
        $user->forceFill([
            'custom_instructions' => $data['custom_instructions'] ?? null,
            'about_me' => $data['about_me'] ?? null,
            'preferences' => array_merge($user->preferences ?? [], [
                'theme' => $data['theme'],
                'voice' => $data['voice'] ?? [],
                'stt_language' => $data['stt_language'] ?? 'de',
            ]),
        ])->save();

        return back()->with('success', 'Einstellungen gespeichert.');
    }
}
