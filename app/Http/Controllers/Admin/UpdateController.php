<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\SettingsService;
use App\Services\Update\UpdateException;
use App\Services\Update\UpdateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UpdateController extends Controller
{
    public function index(UpdateService $updates, SettingsService $settings): Response
    {
        $token = (string) $settings->get('cron_token', '');

        if ($token === '') {
            $token = Str::random(40);
            $settings->set('cron_token', $token);
        }

        $status = $updates->status();
        $installed = $updates->installedVersion();

        return Inertia::render('Admin/Updates', [
            'installed' => $installed,
            'remote' => $status['remote'] ?? null,
            'available' => isset($status['remote']) && version_compare($status['remote'], $installed, '>'),
            'status' => $status,
            'settings' => [
                'repo' => $updates->repository(),
                'branch' => $updates->branch(),
                'auto' => (bool) $settings->get('update_auto'),
                'has_token' => (string) $settings->get('update_token') !== '',
            ],
            'requirements' => $updates->requirements(),
            'cron' => [
                'url' => url('/cron/'.$token),
                'last_run' => $settings->get('cron_last_run') ?: null,
                'queue' => config('queue.default'),
            ],
        ]);
    }

    public function check(UpdateService $updates): RedirectResponse
    {
        try {
            $info = $updates->check();
        } catch (UpdateException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', $info['available'] ? "Update auf {$info['remote']} verfügbar." : "Die Anwendung ist aktuell ({$info['installed']}).");
    }

    public function apply(UpdateService $updates): RedirectResponse
    {
        try {
            $result = $updates->apply();
        } catch (UpdateException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Aktualisiert von {$result['from']} auf {$result['to']}.");
    }

    public function settings(Request $request, SettingsService $settings): RedirectResponse
    {
        $data = $request->validate([
            'repo' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/'],
            'branch' => ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_.\/-]+$/', 'not_regex:/\.\./'],
            'auto' => ['required', 'boolean'],
            'token' => ['nullable', 'string', 'max:300'],
            'clear_token' => ['nullable', 'boolean'],
        ]);

        $settings->set('update_repo', $data['repo']);
        $settings->set('update_branch', $data['branch']);
        $settings->set('update_auto', $data['auto']);

        if ($request->boolean('clear_token')) {
            $settings->set('update_token', '');
        } elseif (filled($data['token'] ?? null)) {
            $settings->set('update_token', $data['token']);
        }

        AuditService::log('update.settings_changed', null, ['repo' => $data['repo'], 'branch' => $data['branch'], 'auto' => $data['auto']]);

        return back()->with('success', 'Update-Einstellungen gespeichert.');
    }

    public function regenerateCronToken(SettingsService $settings): RedirectResponse
    {
        $settings->set('cron_token', Str::random(40));
        AuditService::log('cron.token_regenerated');

        return back()->with('success', 'Neue Cron-URL erzeugt. Die alte URL ist ungültig.');
    }
}
