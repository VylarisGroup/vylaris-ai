<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ai_model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->foreignId('chat_id')->nullable()->constrained()->nullOnDelete();
            $table->string('feature')->default('chat');     // chat, stt, tts, image_generation, embeddings, web_search, agent
            $table->unsignedInteger('tokens_in')->default(0);
            $table->unsignedInteger('tokens_out')->default(0);
            $table->decimal('cost', 12, 6)->default(0);
            $table->unsignedInteger('latency_ms')->default(0);
            $table->string('status')->default('ok');        // ok | error | fallback
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['feature', 'created_at']);
        });

        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ai_model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->string('feature')->nullable();
            $table->string('level')->default('error');
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->text('message');
            $table->json('context')->nullable();
            $table->timestamps();
            $table->index('created_at');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('meta')->nullable();
            $table->string('ip', 64)->nullable();
            $table->timestamps();
            $table->index('created_at');
        });

        // Von Administratoren definierte Agenten (Vorlagen für mehrstufige Aufgaben)
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->longText('instructions');
            $table->json('tools')->nullable();              // erlaubte Tool-Schlüssel
            $table->foreignId('ai_model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->unsignedSmallInteger('max_steps')->default(8);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('agent_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('chat_id')->nullable()->constrained()->nullOnDelete();
            $table->text('goal');
            $table->string('status')->default('queued');    // queued | running | done | failed
            $table->json('steps')->nullable();
            $table->longText('result')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_runs');
        Schema::dropIfExists('agents');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('error_logs');
        Schema::dropIfExists('usage_logs');
    }
};
