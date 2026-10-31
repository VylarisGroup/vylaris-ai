<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Cron per URL für Hosting ohne Shell-Cron: führt den Scheduler und – bei Datenbank-Queue – kurz den Queue-Worker aus.
 */
class CronController extends Controller
{
    public function __invoke(string $token, SettingsService $settings): JsonResponse
    {
        $expected = (string) $settings->get('cron_token', '');

        abort_if($expected === '' || ! hash_equals($expected, $token), 404);

        $lock = Cache::lock('cron-url', 120);

        if (! $lock->get()) {
            return response()->json(['ok' => true, 'busy' => true]);
        }

        try {
            set_time_limit(110);
            ignore_user_abort(true);

            $started = microtime(true);
            Artisan::call('schedule:run');
            $queued = false;

            if (config('queue.default') !== 'sync') {
                Artisan::call('queue:work', ['--stop-when-empty' => true, '--max-time' => 40, '--tries' => 2, '--quiet' => true]);
                $queued = true;
            }

            $settings->set('cron_last_run', now()->toIso8601String());

            return response()->json(['ok' => true, 'scheduler' => true, 'queue' => $queued, 'duration_ms' => (int) ((microtime(true) - $started) * 1000)]);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['ok' => false, 'message' => 'Cron-Lauf fehlgeschlagen.'], 500);
        } finally {
            $lock->release();
        }
    }
}
