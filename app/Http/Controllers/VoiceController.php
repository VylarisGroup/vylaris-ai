<?php

namespace App\Http\Controllers;

use App\Services\Ai\AiException;
use App\Services\Ai\AiGateway;
use App\Services\Features\FeatureManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Sprachfunktionen: STT und TTS laufen serverseitig über die konfigurierten externen Anbieter.
 */
class VoiceController extends Controller
{
    public function __construct(private FeatureManager $features, private AiGateway $gateway) {}

    public function transcribe(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $this->features->status('stt', $user);

        if (! $status['configured']) {
            return response()->json(['message' => 'Spracheingabe ist nicht verfügbar: '.$status['reason']], 503);
        }

        $config = $this->features->config('stt');

        $data = $request->validate([
            'audio' => ['required', 'file', 'max:25600', 'mimetypes:audio/webm,audio/ogg,audio/mpeg,audio/mp4,audio/wav,audio/x-wav,video/webm,video/mp4,audio/x-m4a,application/octet-stream'],
            'language' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\-]+$/'],
        ]);

        $audio = $request->file('audio');
        $ext = match (true) {
            str_contains((string) $audio->getMimeType(), 'ogg') => 'ogg',
            str_contains((string) $audio->getMimeType(), 'mp4') => 'mp4',
            str_contains((string) $audio->getMimeType(), 'mpeg') => 'mp3',
            str_contains((string) $audio->getMimeType(), 'wav') => 'wav',
            default => 'webm',
        };

        $language = $data['language'] ?? null;

        if ($language && ! in_array(strtolower(substr($language, 0, 2)), $config['languages'] ?? [], true)) {
            $language = null;
        }

        try {
            $text = $this->gateway->transcribe($this->features->model('stt'), $audio->getRealPath(), 'aufnahme.'.$ext, $language ? strtolower(substr($language, 0, 2)) : null, $user);
        } catch (AiException $e) {
            return response()->json(['message' => $e->userMessage()], 502);
        }

        return response()->json(['text' => trim($text)]);
    }

    public function speak(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        $status = $this->features->status('tts', $user);

        if (! $status['configured']) {
            return response()->json(['message' => 'Sprachausgabe ist nicht verfügbar: '.$status['reason']], 503);
        }

        $config = $this->features->config('tts');
        $voices = $config['voices'] ?? [];
        $formats = $config['formats'] ?? ['mp3'];

        $data = $request->validate([
            'text' => ['required', 'string', 'max:'.(int) ($config['max_chars'] ?? 4000)],
            'voice' => ['nullable', 'string', 'max:80'],
            'format' => ['nullable', 'string', 'in:'.implode(',', $formats)],
            'speed' => ['nullable', 'numeric', 'between:'.($config['min_speed'] ?? 0.5).','.($config['max_speed'] ?? 2.0)],
        ]);

        $voice = $data['voice'] ?? ($user->preference('voice.name') ?: ($voices[0]['id'] ?? ($voices[0] ?? null)));
        $voiceIds = array_map(fn ($v) => is_array($v) ? $v['id'] : $v, $voices);

        if (! $voice || ($voiceIds && ! in_array($voice, $voiceIds, true))) {
            $voice = $voiceIds[0] ?? 'alloy';
        }

        $text = trim(preg_replace(['/```.*?```/s', '/[*_#>`~|]/', '/\[(\d+)\]/'], ['', '', ''], $data['text']));

        try {
            $audio = $this->gateway->speech($this->features->model('tts'), $text, $voice, $data['format'] ?? ($config['default_format'] ?? 'mp3'), (float) ($data['speed'] ?? 1.0), $user);
        } catch (AiException $e) {
            return response()->json(['message' => $e->userMessage()], 502);
        }

        return response($audio['body'], 200, ['Content-Type' => $audio['mime'], 'Cache-Control' => 'no-store']);
    }
}
