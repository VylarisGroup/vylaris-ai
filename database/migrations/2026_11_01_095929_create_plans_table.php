<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description', 500)->nullable();
            $table->unsignedInteger('price_cents')->default(0);
            $table->string('currency', 3)->default('CHF');
            $table->string('interval')->default('month');          // month | year
            $table->unsignedSmallInteger('trial_days')->default(0);
            $table->json('limits')->nullable();                    // messages_per_day, tokens_per_month, uploads_per_day (-1 = unbegrenzt)
            $table->json('allowed_tiers')->nullable();             // null = alle Modellstufen
            $table->json('highlights')->nullable();                // Aufzählung auf der Preisseite
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);         // Gratis-Plan für Benutzer ohne Abo
            $table->boolean('is_featured')->default(false);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
