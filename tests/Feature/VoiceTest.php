<?php

namespace Tests\Feature;

use App\Models\Feature;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class VoiceTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
    }

    public function test_voice_features_report_not_configured(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)->postJson('/voice/speak', ['text' => 'Hallo'])->assertStatus(503);
        $this->actingAs($user)->post('/voice/transcribe', ['audio' => UploadedFile::fake()->create('a.webm', 10, 'audio/webm')], ['Accept' => 'application/json'])->assertStatus(503);
    }

    public function test_speech_to_text_uses_assigned_model(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel(['stt']);
        Feature::where('key', 'stt')->update(['is_enabled' => true, 'ai_model_id' => $model->id]);
        Http::fake(['*' => Http::response(['text' => ' Das ist ein Test '], 200)]);

        $this->actingAs($user)->post('/voice/transcribe', ['audio' => UploadedFile::fake()->create('a.webm', 10, 'audio/webm'), 'language' => 'de'], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('text', 'Das ist ein Test');

        Http::assertSent(fn ($r) => str_ends_with($r->url(), '/audio/transcriptions'));
    }

    public function test_text_to_speech_returns_audio_and_respects_voice_whitelist(): void
    {
        $user = $this->makeUser();
        $model = $this->makeChatModel(['tts']);
        Feature::where('key', 'tts')->update(['is_enabled' => true, 'ai_model_id' => $model->id, 'config' => ['voices' => [['id' => 'nova', 'label' => 'Nova']], 'formats' => ['mp3', 'wav'], 'default_format' => 'mp3', 'min_speed' => 0.5, 'max_speed' => 2, 'max_chars' => 500]]);
        Http::fake(['*' => Http::response('AUDIO', 200, ['Content-Type' => 'audio/mpeg'])]);

        $response = $this->actingAs($user)->postJson('/voice/speak', ['text' => '**Hallo** Welt', 'voice' => 'unbekannt', 'speed' => 1.25, 'format' => 'mp3']);

        $response->assertOk()->assertHeader('Content-Type', 'audio/mpeg');
        Http::assertSent(fn ($r) => $r['voice'] === 'nova' && $r['speed'] == 1.25 && $r['input'] === 'Hallo Welt');

        $this->actingAs($user)->postJson('/voice/speak', ['text' => 'x', 'format' => 'flac'])->assertStatus(422);
        $this->actingAs($user)->postJson('/voice/speak', ['text' => 'x', 'speed' => 5])->assertStatus(422);
    }
}
