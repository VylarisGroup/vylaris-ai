<?php

namespace App\Console\Commands;

use App\Services\SettingsService;
use App\Services\Update\UpdateException;
use App\Services\Update\UpdateService;
use Illuminate\Console\Command;

class UpdateCommand extends Command
{
    protected $signature = 'vylaris:update {--check : Nur prüfen, nichts installieren} {--auto : Nur ausführen, wenn automatische Updates aktiviert sind}';

    protected $description = 'Prüft die VERSION-Datei auf GitHub und installiert bei einer höheren Version das Update aus dem ZIP.';

    public function handle(UpdateService $updates, SettingsService $settings): int
    {
        if ($this->option('auto') && ! $settings->get('update_auto')) {
            return self::SUCCESS;
        }

        try {
            $info = $updates->check();
        } catch (UpdateException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->line("Installiert: {$info['installed']}  ·  GitHub: {$info['remote']}");

        if (! $info['available']) {
            $this->info('Die Anwendung ist aktuell.');

            return self::SUCCESS;
        }

        if ($this->option('check')) {
            $this->warn("Update auf {$info['remote']} verfügbar.");

            return self::SUCCESS;
        }

        if ($this->option('auto') && ($updates->status()['failed_version'] ?? null) === $info['remote']) {
            $this->warn("Automatisches Update auf {$info['remote']} ist bereits fehlgeschlagen und wird nicht wiederholt (manuell im Admin-Bereich starten).");

            return self::SUCCESS;
        }

        try {
            $updates->apply(fn (string $message) => $this->line($message));
        } catch (UpdateException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info('Update abgeschlossen.');

        return self::SUCCESS;
    }
}
