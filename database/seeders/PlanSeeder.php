<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        if (Plan::query()->exists()) {
            return;
        }

        Plan::create([
            'name' => 'Gratis', 'slug' => 'gratis', 'description' => 'Zum Ausprobieren.', 'price_cents' => 0, 'sort' => 1, 'is_default' => true,
            'limits' => ['messages_per_day' => 30, 'tokens_per_month' => 300000, 'uploads_per_day' => 5],
            'allowed_tiers' => ['fast', 'balanced'],
            'highlights' => ['30 Nachrichten pro Tag', 'Schnelle und ausgewogene Modelle', 'Memory und Projekte'],
        ]);

        Plan::create([
            'name' => 'Pro', 'slug' => 'pro', 'description' => 'Für den täglichen Einsatz.', 'price_cents' => 1900, 'sort' => 2, 'is_featured' => true,
            'limits' => ['messages_per_day' => 500, 'tokens_per_month' => 5000000, 'uploads_per_day' => 100],
            'highlights' => ['500 Nachrichten pro Tag', 'Alle Modelle inkl. starker Stufe', 'Websuche, Bilder und Dokumente', 'Priorisierte Verarbeitung'],
        ]);

        Plan::create([
            'name' => 'Max', 'slug' => 'max', 'description' => 'Für Vielnutzer und Teams.', 'price_cents' => 4900, 'sort' => 3,
            'limits' => ['messages_per_day' => -1, 'tokens_per_month' => -1, 'uploads_per_day' => -1],
            'highlights' => ['Unbegrenzte Nachrichten', 'Alle Modelle und Funktionen', 'Höchste Priorität'],
        ]);
    }
}
