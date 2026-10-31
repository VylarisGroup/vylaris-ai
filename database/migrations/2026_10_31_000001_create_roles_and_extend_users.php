<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            // Liste von Berechtigungs-Schlüsseln, "*" = alles
            $table->json('permissions')->nullable();
            // z. B. {"messages_per_day": 200, "tokens_per_month": 500000, "uploads_per_day": 20}
            $table->json('limits')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('id')->constrained('roles')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('password');
            $table->text('custom_instructions')->nullable();
            $table->text('about_me')->nullable();
            $table->json('preferences')->nullable();
            $table->json('limit_overrides')->nullable();
            $table->timestamp('last_seen_at')->nullable();
        });

        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->string('provider_user_id');
            $table->timestamps();
            $table->unique(['provider', 'provider_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
            $table->dropColumn(['is_active', 'custom_instructions', 'about_me', 'preferences', 'limit_overrides', 'last_seen_at']);
        });
        Schema::dropIfExists('roles');
    }
};
