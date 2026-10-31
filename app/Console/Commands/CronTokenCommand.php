<?php

namespace App\Console\Commands;

use App\Services\SettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CronTokenCommand extends Command
{
    protected $signature = 'vylaris:cron-token {--regenerate : Neuen Token erzeugen (alte URL wird ungültig)}';

    protected $description = 'Zeigt die Cron-URL an und erzeugt bei Bedarf den geheimen Token.';

    public function handle(SettingsService $settings): int
    {
        $token = (string) $settings->get('cron_token', '');

        if ($token === '' || $this->option('regenerate')) {
            $token = Str::random(40);
            $settings->set('cron_token', $token);
        }

        $this->line(url('/cron/'.$token));

        return self::SUCCESS;
    }
}
