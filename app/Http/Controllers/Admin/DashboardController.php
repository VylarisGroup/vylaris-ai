<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\Chat;
use App\Models\ErrorLog;
use App\Models\Message;
use App\Models\Provider;
use App\Models\UsageLog;
use App\Models\User;
use App\Services\Features\FeatureManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(FeatureManager $features): Response
    {
        $since = now()->subDays(29)->startOfDay();

        $daily = UsageLog::query()
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as requests, COALESCE(SUM(tokens_in),0) as tokens_in, COALESCE(SUM(tokens_out),0) as tokens_out, COALESCE(SUM(cost),0) as cost')
            ->groupBy('day')->orderBy('day')->get()->keyBy('day');

        $series = collect(range(0, 29))->map(function ($i) use ($since, $daily) {
            $day = $since->copy()->addDays($i)->toDateString();
            $row = $daily->get($day);

            return ['day' => $day, 'requests' => (int) ($row->requests ?? 0), 'tokens' => (int) (($row->tokens_in ?? 0) + ($row->tokens_out ?? 0)), 'cost' => round((float) ($row->cost ?? 0), 4)];
        });

        return Inertia::render('Admin/Dashboard', [
            'totals' => [
                'users' => User::count(),
                'active_users_7d' => User::where('last_seen_at', '>=', now()->subDays(7))->count(),
                'chats' => Chat::count(),
                'messages' => Message::count(),
                'tokens_30d' => (int) UsageLog::where('created_at', '>=', $since)->sum(DB::raw('tokens_in + tokens_out')),
                'cost_30d' => round((float) UsageLog::where('created_at', '>=', $since)->sum('cost'), 4),
                'errors_24h' => ErrorLog::where('created_at', '>=', now()->subDay())->count(),
            ],
            'series' => $series,
            'topModels' => UsageLog::query()->where('created_at', '>=', $since)->whereNotNull('ai_model_id')
                ->selectRaw('ai_model_id, COUNT(*) as requests, SUM(tokens_in + tokens_out) as tokens, SUM(cost) as cost')
                ->groupBy('ai_model_id')->orderByDesc('requests')->limit(8)->get()
                ->map(fn ($r) => ['name' => AiModel::find($r->ai_model_id)?->display_name ?? 'gelöscht', 'requests' => (int) $r->requests, 'tokens' => (int) $r->tokens, 'cost' => round((float) $r->cost, 4)]),
            'features' => collect($features->all())->map(fn ($f, $key) => ['key' => $key, 'name' => $f->name] + $features->status($key, auth()->user()))->values(),
            'providers' => Provider::withCount('models')->get(['id', 'name', 'is_enabled', 'is_fallback']),
        ]);
    }

    public function system(Request $request): Response
    {
        $checks = [];

        try {
            DB::connection()->getPdo();
            $checks[] = ['name' => 'Datenbank', 'ok' => true, 'detail' => DB::connection()->getDriverName()];
        } catch (\Throwable $e) {
            $checks[] = ['name' => 'Datenbank', 'ok' => false, 'detail' => 'Nicht erreichbar'];
        }

        try {
            Cache::put('health', 1, 10);
            $checks[] = ['name' => 'Cache', 'ok' => Cache::get('health') === 1, 'detail' => config('cache.default')];
        } catch (\Throwable) {
            $checks[] = ['name' => 'Cache', 'ok' => false, 'detail' => 'Fehler'];
        }

        $pending = DB::table(config('queue.connections.database.table', 'jobs'))->count();
        $failed = DB::table(config('queue.failed.table', 'failed_jobs'))->count();
        $checks[] = ['name' => 'Queue', 'ok' => $failed === 0, 'detail' => config('queue.default').": {$pending} wartend, {$failed} fehlgeschlagen"];

        $writable = is_writable(storage_path('app')) && is_writable(storage_path('logs'));
        $checks[] = ['name' => 'Speicher', 'ok' => $writable, 'detail' => $writable ? 'Beschreibbar' : 'Nicht beschreibbar'];
        $checks[] = ['name' => 'Verschlüsselung', 'ok' => ! empty(config('app.key')), 'detail' => 'APP_KEY '.(config('app.key') ? 'gesetzt' : 'fehlt')];
        $checks[] = ['name' => 'Debug-Modus', 'ok' => ! config('app.debug'), 'detail' => config('app.debug') ? 'Aktiv (nur Entwicklung!)' : 'Aus'];
        $checks[] = ['name' => 'HTTPS', 'ok' => $request->isSecure(), 'detail' => $request->isSecure() ? 'Aktiv' : 'Nicht aktiv'];
        $checks[] = ['name' => 'Mail', 'ok' => config('mail.default') !== 'log', 'detail' => config('mail.default') === 'log' ? 'Log-Treiber – E-Mails werden nicht versendet' : config('mail.default')];
        $checks[] = ['name' => 'PHP', 'ok' => version_compare(PHP_VERSION, '8.3.0', '>='), 'detail' => PHP_VERSION];

        return Inertia::render('Admin/System', [
            'checks' => $checks,
            'info' => [
                'laravel' => app()->version(),
                'environment' => app()->environment(),
                'storage_used_mb' => round(collect(Storage::disk('private')->allFiles())->sum(fn ($f) => Storage::disk('private')->size($f)) / 1048576, 1),
            ],
            'failedJobs' => DB::table(config('queue.failed.table', 'failed_jobs'))->latest('id')->limit(10)->get(['id', 'queue', 'failed_at', DB::raw('substr(exception, 1, 200) as exception')]),
        ]);
    }
}
