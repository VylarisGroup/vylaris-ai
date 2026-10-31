<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });

        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ai_model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->string('title')->default('Neuer Chat');
            $table->text('instructions')->nullable();
            $table->json('parameters')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'archived_at', 'last_message_at']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_model_id')->nullable()->constrained('ai_models')->nullOnDelete();
            $table->string('role');                         // user | assistant | system | tool
            $table->longText('content')->nullable();
            $table->text('reasoning')->nullable();
            $table->json('sources')->nullable();            // Websuche-Quellen
            $table->json('tool_events')->nullable();        // Agenten-/Tool-Schritte
            $table->json('generated')->nullable();          // erzeugte Bilder/Dokumente (file ids)
            $table->string('rating')->nullable();           // up | down
            $table->text('rating_comment')->nullable();
            $table->string('status')->default('done');      // streaming | done | error | stopped
            $table->text('error')->nullable();
            $table->unsignedInteger('tokens_in')->default(0);
            $table->unsignedInteger('tokens_out')->default(0);
            $table->decimal('cost', 12, 6)->default(0);
            $table->timestamps();
            $table->index(['chat_id', 'id']);
        });

        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('chat_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('disk')->default('private');
            $table->string('path');
            $table->string('original_name');
            $table->string('mime');
            $table->string('kind');                         // document | image | audio | generated
            $table->unsignedBigInteger('size');
            $table->string('sha256', 64)->nullable();
            $table->longText('extracted_text')->nullable();
            $table->string('status')->default('pending');   // pending | processing | ready | failed
            $table->text('status_message')->nullable();
            $table->boolean('in_knowledge_base')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'project_id']);
        });

        Schema::create('file_message', function (Blueprint $table) {
            $table->foreignId('file_id')->constrained()->cascadeOnDelete();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->primary(['file_id', 'message_id']);
        });

        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('file_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->text('content');
            $table->json('embedding')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'user_id']);
        });

        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->string('source')->default('auto');      // auto | manual
            $table->foreignId('chat_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memories');
        Schema::dropIfExists('knowledge_chunks');
        Schema::dropIfExists('file_message');
        Schema::dropIfExists('files');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('chats');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('folders');
    }
};
