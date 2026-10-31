<?php

namespace Tests\Feature;

use App\Jobs\ExtractMemoriesJob;
use App\Jobs\GenerateChatTitleJob;
use App\Models\Chat;
use App\Models\ErrorLog;
use App\Models\Provider;
use App\Models\UsageLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class ChatStreamTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
        Queue::fake();
    }

    public function test_dispatches_title_and_memory_jobs_after_first_answer(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel();
        Http::fake(['*' => Http::response($this->sseBody(['Antwort']), 200)]);

        $this->actingAs($user)->post('/chat/stream', ['content' => 'Ich arbeite als Schreiner und baue Möbel.', 'model_id' => $model->id])->streamedContent();

        Queue::assertPushed(GenerateChatTitleJob::class);
        Queue::assertPushed(ExtractMemoriesJob::class);
    }

    public function test_image_mode_without_image_generation_reports_not_configured(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel();
        Http::fake(['*' => Http::response($this->sseBody(['ok']), 200)]);

        $body = $this->actingAs($user)->post('/chat/stream', ['content' => 'Male eine Katze', 'model_id' => $model->id, 'image_mode' => true])->streamedContent();

        $this->assertStringContainsString('Bildgenerierung ist nicht konfiguriert', $body);
        $this->assertStringContainsString('"type":"done"', $body);
    }

    public function test_streams_answer_persists_messages_and_logs_usage(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel();
        Http::fake(['api.example-ai.test/*' => Http::response($this->sseBody(['Hal', 'lo ', 'Welt']), 200, ['Content-Type' => 'text/event-stream'])]);

        $response = $this->actingAs($user)->post('/chat/stream', ['content' => 'Sag Hallo', 'model_id' => $model->id]);
        $body = $response->streamedContent();

        $response->assertOk();
        $this->assertStringContainsString('"type":"delta","text":"Hal"', $body);
        $this->assertStringContainsString('"type":"done"', $body);

        $chat = Chat::first();
        $this->assertSame($user->id, $chat->user_id);
        $this->assertSame('Hallo Welt', $chat->messages()->where('role', 'assistant')->first()->content);
        $this->assertSame('done', $chat->messages()->where('role', 'assistant')->first()->status);

        $usage = UsageLog::first();
        $this->assertSame(12, $usage->tokens_in);
        $this->assertSame(5, $usage->tokens_out);
        $this->assertEqualsWithDelta((12 * 1 + 5 * 2) / 1_000_000, $usage->cost, 0.0000001);
    }

    public function test_sends_authorization_header_and_model_name_to_provider(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel();
        Http::fake(['*' => Http::response($this->sseBody(['ok']), 200)]);

        $this->actingAs($user)->post('/chat/stream', ['content' => 'x', 'model_id' => $model->id])->streamedContent();

        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer sk-test-secret-key')
            && $request['model'] === $model->model_id
            && $request['stream'] === true
            && str_ends_with($request->url(), '/chat/completions'));
    }

    public function test_falls_back_to_secondary_provider_on_server_error(): void
    {
        $user = $this->makeUser();
        $primary = $this->makeChatModel();
        $fallbackProvider = Provider::factory()->fallback()->create(['base_url' => 'https://fallback.example-ai.test/v1']);
        $fallback = $this->makeChatModel(attributes: ['provider_id' => $fallbackProvider->id, 'display_name' => 'Fallback-Modell']);

        Http::fake([
            'api.example-ai.test/*' => Http::response(['error' => ['message' => 'overloaded']], 503),
            'fallback.example-ai.test/*' => Http::response($this->sseBody(['Antwort vom Fallback']), 200),
        ]);

        $body = $this->actingAs($user)->post('/chat/stream', ['content' => 'Hi', 'model_id' => $primary->id])->streamedContent();

        $this->assertStringContainsString('Antwort vom Fallback', $body);
        $this->assertStringContainsString('Fallback-Modell', $body);
        $this->assertSame(1, ErrorLog::where('http_status', 503)->count());
        $this->assertSame('fallback', UsageLog::first()->status);
    }

    public function test_provider_error_is_reported_without_leaking_details(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel();
        Http::fake(['*' => Http::response(['error' => ['message' => 'Incorrect API key sk-test-secret-key']], 401)]);

        $body = $this->actingAs($user)->post('/chat/stream', ['content' => 'Hi', 'model_id' => $model->id])->streamedContent();

        $this->assertStringContainsString('"type":"error"', $body);
        $this->assertStringNotContainsString('sk-test-secret-key', $body);
        $this->assertSame('error', Chat::first()->messages()->where('role', 'assistant')->first()->status);
    }

    public function test_reports_when_no_model_is_configured(): void
    {
        $body = $this->actingAs($this->makeUser())->post('/chat/stream', ['content' => 'Hi'])->streamedContent();

        $this->assertStringContainsString('kein Chat-Modell', $body);
    }

    public function test_daily_message_limit_is_enforced(): void
    {
        $user = $this->makeUser('user', ['limit_overrides' => ['messages_per_day' => 1]]);
        $model = $this->makeChatModel();
        Http::fake(['*' => Http::response($this->sseBody(['ok']), 200)]);

        $this->actingAs($user)->post('/chat/stream', ['content' => 'eins', 'model_id' => $model->id])->streamedContent();
        $body = $this->actingAs($user)->post('/chat/stream', ['content' => 'zwei', 'model_id' => $model->id])->streamedContent();

        $this->assertStringContainsString('Tageslimit', $body);
    }

    public function test_tool_loop_creates_document_for_models_with_tools(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel(['chat', 'streaming', 'tools']);

        $toolCall = 'data: '.json_encode(['choices' => [['delta' => ['tool_calls' => [['index' => 0, 'id' => 'call_1', 'function' => ['name' => 'create_document', 'arguments' => json_encode(['title' => 'Notiz', 'format' => 'md', 'content' => '# Hallo'])]]]], 'finish_reason' => 'tool_calls']]])."\n\ndata: [DONE]\n\n";

        Http::fake(['*' => Http::sequence()
            ->push($toolCall, 200)
            ->push($this->sseBody(['Dokument erstellt.']), 200)]);

        $body = $this->actingAs($user)->post('/chat/stream', ['content' => 'Erstelle eine Notiz', 'model_id' => $model->id])->streamedContent();

        $this->assertStringContainsString('"type":"generated"', $body);
        $this->assertStringContainsString('Dokument erstellt.', $body);
        $this->assertSame(1, $user->files()->where('kind', 'generated')->count());
    }

    public function test_user_can_edit_message_and_regenerate(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel();
        Http::fake(['*' => Http::sequence()->push($this->sseBody(['erste']), 200)->push($this->sseBody(['zweite']), 200)->push($this->sseBody(['dritte']), 200)]);

        $this->actingAs($user)->post('/chat/stream', ['content' => 'Frage', 'model_id' => $model->id])->streamedContent();
        $chat = Chat::first();
        $userMessage = $chat->messages()->where('role', 'user')->first();

        $this->actingAs($user)->post("/messages/{$userMessage->id}/edit", ['content' => 'Neue Frage'])->streamedContent();
        $this->assertSame(['Neue Frage', 'zweite'], $chat->messages()->pluck('content')->all());

        $this->actingAs($user)->post("/chats/{$chat->id}/regenerate")->streamedContent();
        $this->assertSame(['Neue Frage', 'dritte'], $chat->messages()->pluck('content')->all());
    }
}
