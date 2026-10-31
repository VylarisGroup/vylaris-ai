<?php

namespace App\Http\Controllers;

use App\Jobs\ExportUserDataJob;
use App\Models\Chat;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrivacyController extends Controller
{
    public function index(Request $request): Response
    {
        $export = $request->user()->preference('last_export');

        return Inertia::render('Settings/Privacy', [
            'hasExport' => $export && Storage::disk('private')->exists($export),
            'stats' => [
                'chats' => $request->user()->chats()->count(),
                'files' => $request->user()->files()->count(),
                'memories' => $request->user()->memories()->count(),
            ],
        ]);
    }

    public function requestExport(Request $request): RedirectResponse
    {
        ExportUserDataJob::dispatch($request->user()->id);
        AuditService::log('privacy.export_requested');

        return back()->with('success', 'Der Export wird erstellt. Sie erhalten eine E-Mail, sobald er bereit ist.');
    }

    public function downloadExport(Request $request): StreamedResponse
    {
        $path = $request->user()->preference('last_export');
        abort_unless($path && str_starts_with($path, 'exports/'.$request->user()->id.'/') && Storage::disk('private')->exists($path), 404);

        return Storage::disk('private')->download($path, 'vylaris-export.zip');
    }

    public function destroyChats(Request $request): RedirectResponse
    {
        $request->user()->chats()->get()->each(function (Chat $chat) {
            $chat->files()->whereNull('project_id')->get()->each->delete();
            $chat->delete();
        });
        AuditService::log('privacy.chats_deleted');

        return back()->with('success', 'Alle Chats wurden gelöscht.');
    }

    /**
     * Account und sämtliche Daten unwiderruflich löschen.
     */
    public function destroyAccount(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();

        abort_if($user->isAdmin() && User::whereHas('role', fn ($q) => $q->where('slug', 'admin'))->where('is_active', true)->count() <= 1, 422, 'Der letzte Administrator kann nicht gelöscht werden.');

        AuditService::log('account.deleted', $user, ['email_hash' => hash('sha256', $user->email)]);

        $user->files()->get()->each->delete();
        Storage::disk('private')->deleteDirectory('exports/'.$user->id);
        Storage::disk('private')->deleteDirectory('generated/'.$user->id);
        Storage::disk('private')->deleteDirectory('uploads/'.$user->id);

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
