<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            // openai_compatible | azure_openai
            $table->string('driver')->default('openai_compatible');
            $table->string('template')->nullable();
            $table->string('base_url');
            $table->text('api_key')->nullable();           // verschlüsselt (Cast)
            $table->text('extra_headers')->nullable();     // verschlüsselt (Cast), JSON
            $table->string('api_version')->nullable();     // Azure
            $table->unsignedInteger('timeout')->default(120);
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_fallback')->default(false);
            $table->unsignedInteger('priority')->default(100);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->cascadeOnDelete();
            $table->string('model_id');                    // Name, der an die API gesendet wird
            $table->string('display_name');
            $table->string('tier')->default('balanced');   // fast | balanced | strong
            $table->json('parameters')->nullable();        // Standardparameter (temperature, top_p, max_tokens, ...)
            $table->json('allowed_parameters')->nullable(); // Parameter, die Nutzer ändern dürfen
            $table->unsignedInteger('context_window')->nullable();
            $table->decimal('price_input', 12, 6)->default(0);   // pro 1 Mio. Tokens
            $table->decimal('price_output', 12, 6)->default(0);  // pro 1 Mio. Tokens
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_default')->default(false);
            $table->unsignedInteger('sort')->default(100);
            $table->timestamps();
            $table->unique(['provider_id', 'model_id']);
        });

        // Capability-Zuordnung pro Modell (und damit pro Provider)
        Schema::create('model_capabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_model_id')->constrained('ai_models')->cascadeOnDelete();
            $table->string('capability');                  // chat, streaming, vision, tools, stt, tts, image_generation, embeddings, reasoning
            $table->json('config')->nullable();            // z. B. Stimmen, Formate, Bildgrössen, Embedding-Dimension
            $table->timestamps();
            $table->unique(['ai_model_id', 'capability']);
        });

        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();               // web_search, stt, tts, image_generation, files, memory, rag, agents ...
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_enabled')->default(false);
            $table->foreignId('ai_model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->json('config')->nullable();
            $table->timestamps();
        });

        // Leere Zuordnung = Feature für alle Rollen verfügbar
        Schema::create('feature_role', function (Blueprint $table) {
            $table->foreignId('feature_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['feature_id', 'role_id']);
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->longText('value')->nullable();
            $table->boolean('is_secret')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('feature_role');
        Schema::dropIfExists('features');
        Schema::dropIfExists('model_capabilities');
        Schema::dropIfExists('ai_models');
        Schema::dropIfExists('providers');
    }
};
