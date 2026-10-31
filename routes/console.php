<?php

use App\Models\ErrorLog;
use App\Models\UsageLog;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    $days = (int) app(SettingsService::class)->get('log_retention_days', 90);

    if ($days > 0) {
        $cutoff = now()->subDays($days);
        UsageLog::where('created_at', '<', $cutoff)->delete();
        ErrorLog::where('created_at', '<', $cutoff)->delete();
    }
})->daily()->name('prune-logs');

Schedule::command('queue:prune-failed --hours=720')->daily();
