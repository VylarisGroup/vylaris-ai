<?php

namespace App\Services\Ai;

use App\Enums\Capability;
use App\Models\AiModel;
use App\Models\Chat;
use App\Models\ErrorLog;
use App\Models\UsageLog;
use App\Models\User;
use App\Services\SettingsService;
use Generator;
use Illuminate\Support\Collection;

/**
 * Zentrale Schnittstelle zu allen externen KI-Anbietern: Modellwahl, Fallback, Logging, Kosten.
 */
class AiGateway
{
    /**
     * Parameter, die Benutzer grundsätzlich überschreiben dürfen (Modell kann einschränken).
     *
     * @var array<string, array{0: float, 1: float}>
     */
    public const PARAMETER_RANGES = [
        'temperature' => [0, 2],
        'top_p' => [0, 1],
        'presence_penalty' => [-2, 2],
        'frequency_penalty' => [-2, 2],
        'max_tokens' => [1, 128000],
    ];

    public function __construct(private SettingsService $settings) {}

    public function client(AiModel $model): ProviderClient
    {
        return new ProviderClient($model->provider);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function sanitizeParameters(AiModel $model, array $input): array
    {
        $allowed = $model->allowed_parameters ?? array_keys(self::PARAMETER_RANGES);
        $clean = [];

        foreach (self::PARAMETER_RANGES as $key => [$min, $max]) {
            if (! in_array($key, $allowed, true) || ! isset($input[$key]) || ! is_numeric($input[$key])) {
                continue;
            }

            $value = max($min, min($max, $input[$key] + 0));
            $clean[$key] = $key === 'max_tokens' ? (int) $value : (float) $value;
        }

        return $clean;
    }

    /**
     * Primärmodell gefolgt von Fallback-Modellen, die alle geforderten Capabilities besitzen.
     *
     * @param  array<int, string>  $required
     * @return Collection<int, AiModel>
     */
    public function candidates(AiModel $primary, array $required = ['chat']): Collection
    {
        $list = collect();

        if ($primary->is_enabled && $primary->provider?->is_enabled) {
            $list->push($primary);
        }

        $limit = max(0, (int) $this->settings->get('max_fallback_attempts', 2));

        if ($limit > 0) {
            $fallbacks = AiModel::query()
                ->with(['provider', 'capabilities'])
                ->where('is_enabled', true)
                ->where('id', '!=', $primary->id)
                ->whereHas('provider', fn ($q) => $q->where('is_enabled', true)->where('is_fallback', true))
                ->get()
                ->filter(fn (AiModel $m) => collect($required)->every(fn ($c) => $m->hasCapability($c)))
                ->sortBy(fn (AiModel $m) => [$m->provider->priority, $m->sort])
                ->take($limit);

            $list = $list->concat($fallbacks);
        }

        return $list->values();
    }

    /**
     * @param  array<int, array<string, mixed>>  $messages
     * @param  array<string, mixed>  $overrides
     * @param  array<int, array<string, mixed>>|null  $tools
     * @return array<string, mixed>
     */
    private function payloadFor(AiModel $model, array $messages, array $overrides, ?array $tools): array
    {
        $payload = ['messages' => $messages] + array_merge($model->parameters ?? [], $overrides);

        if ($tools && $model->hasCapability(Capability::Tools)) {
            $payload['tools'] = $tools;
            $payload['tool_choice'] = 'auto';
        }

        return $payload;
    }

    /**
     * Nicht-streamende Anfrage mit Fallback.
     *
     * @param  array<int, array<string, mixed>>  $messages
     * @param  array<string, mixed>  $overrides
     * @param  array<int, array<string, mixed>>|null  $tools
     * @param  array<int, string>  $required
     * @return array{content: string, tool_calls: array<int, array<string, mixed>>, tokens_in: int, tokens_out: int, model: AiModel}
     */
    public function chat(AiModel $model, array $messages, array $overrides = [], ?array $tools = null, array $required = ['chat'], ?User $user = null, ?Chat $chat = null, string $feature = 'chat'): array
    {
        $last = null;

        foreach ($this->candidates($model, $required) as $index => $candidate) {
            $started = microtime(true);

            try {
                $response = $this->client($candidate)->chat($candidate, $this->payloadFor($candidate, $messages, $overrides, $tools));
                $message = $response['choices'][0]['message'] ?? [];
                $in = (int) ($response['usage']['prompt_tokens'] ?? $this->estimate(json_encode($messages)));
                $out = (int) ($response['usage']['completion_tokens'] ?? $this->estimate((string) ($message['content'] ?? '')));

                $this->recordUsage($candidate, $user, $chat, $feature, $in, $out, $started, $index > 0 ? 'fallback' : 'ok');

                $calls = [];
                foreach ($message['tool_calls'] ?? [] as $call) {
                    $calls[] = ['id' => $call['id'] ?? '', 'name' => $call['function']['name'] ?? '', 'arguments' => $call['function']['arguments'] ?? '{}'];
                }

                return ['content' => (string) ($message['content'] ?? ''), 'tool_calls' => $calls, 'tokens_in' => $in, 'tokens_out' => $out, 'model' => $candidate];
            } catch (AiException $e) {
                $this->recordError($candidate, $user, $feature, $e);
                $last = $e;

                if (! $e->retryable) {
                    break;
                }
            }
        }

        throw $last ?? new AiException('Kein verfügbares Modell für diese Anfrage.', null, false);
    }

    /**
     * Streamende Anfrage mit Fallback (nur solange noch keine Ausgabe erfolgt ist).
     * Ereignisse enthalten zusätzlich 'model' (AiModel) bei 'start'.
     *
     * @param  array<int, array<string, mixed>>  $messages
     * @param  array<string, mixed>  $overrides
     * @param  array<int, array<string, mixed>>|null  $tools
     * @param  array<int, string>  $required
     * @return Generator<int, array<string, mixed>>
     */
    public function stream(AiModel $model, array $messages, array $overrides = [], ?array $tools = null, array $required = ['chat'], ?User $user = null, ?Chat $chat = null): Generator
    {
        $last = null;
        $candidates = $this->candidates($model, $required);

        foreach ($candidates as $index => $candidate) {
            $started = microtime(true);
            $emitted = false;
            $in = 0;
            $out = 0;
            $text = '';

            yield ['type' => 'start', 'model' => $candidate, 'fallback' => $index > 0];

            try {
                if (! $candidate->hasCapability(Capability::Streaming)) {
                    $result = $this->chat($candidate, $messages, $overrides, $tools, $required, $user, $chat);

                    if ($result['content'] !== '') {
                        yield ['type' => 'delta', 'text' => $result['content']];
                    }

                    if ($result['tool_calls']) {
                        yield ['type' => 'tool_calls', 'calls' => $result['tool_calls']];
                    }

                    yield ['type' => 'usage', 'in' => $result['tokens_in'], 'out' => $result['tokens_out']];

                    return;
                }

                foreach ($this->client($candidate)->chatStream($candidate, $this->payloadFor($candidate, $messages, $overrides, $tools)) as $event) {
                    if ($event['type'] === 'delta' || $event['type'] === 'tool_calls') {
                        $emitted = true;
                    }

                    if ($event['type'] === 'delta') {
                        $text .= $event['text'];
                    }

                    if ($event['type'] === 'usage') {
                        $in = $event['in'];
                        $out = $event['out'];
                    }

                    yield $event;
                }

                if ($in === 0 && $out === 0) {
                    $in = $this->estimate(json_encode($messages));
                    $out = $this->estimate($text);
                    yield ['type' => 'usage', 'in' => $in, 'out' => $out, 'estimated' => true];
                }

                $this->recordUsage($candidate, $user, $chat, 'chat', $in, $out, $started, $index > 0 ? 'fallback' : 'ok');

                return;
            } catch (AiException $e) {
                $this->recordError($candidate, $user, 'chat', $e);
                $last = $e;

                if ($emitted || ! $e->retryable) {
                    throw $e;
                }
            }
        }

        throw $last ?? new AiException('Kein verfügbares Modell für diese Anfrage.', null, false);
    }

    public function transcribe(AiModel $model, string $path, string $filename, ?string $language, ?User $user): string
    {
        return $this->simple($model, $user, 'stt', fn (ProviderClient $c, AiModel $m) => $c->transcribe($m, $path, $filename, $language), ['stt']);
    }

    /**
     * @return array{body: string, mime: string}
     */
    public function speech(AiModel $model, string $text, string $voice, string $format, float $speed, ?User $user): array
    {
        return $this->simple($model, $user, 'tts', fn (ProviderClient $c, AiModel $m) => $c->speech($m, $text, $voice, $format, $speed), ['tts'], $this->estimate($text), 0);
    }

    /**
     * @return array<int, array{b64: ?string, url: ?string, revised_prompt: ?string}>
     */
    public function generateImage(AiModel $model, string $prompt, string $size, ?User $user, ?Chat $chat = null): array
    {
        return $this->simple($model, $user, 'image_generation', fn (ProviderClient $c, AiModel $m) => $c->generateImage($m, $prompt, $size), ['image_generation'], 0, 0, $chat);
    }

    /**
     * @param  array<int, string>  $inputs
     * @return array<int, array<int, float>>
     */
    public function embed(AiModel $model, array $inputs, ?User $user): array
    {
        $tokens = $this->estimate(implode(' ', $inputs));

        return $this->simple($model, $user, 'embeddings', fn (ProviderClient $c, AiModel $m) => $c->embeddings($m, $inputs), ['embeddings'], $tokens, 0);
    }

    /**
     * Einfache (nicht-chat) Anfrage mit Fallback über Modelle gleicher Capability.
     *
     * @param  callable(ProviderClient, AiModel): mixed  $call
     * @param  array<int, string>  $required
     */
    private function simple(AiModel $model, ?User $user, string $feature, callable $call, array $required, int $tokensIn = 0, int $tokensOut = 0, ?Chat $chat = null): mixed
    {
        $last = null;

        foreach ($this->candidates($model, $required) as $index => $candidate) {
            $started = microtime(true);

            try {
                $result = $call($this->client($candidate), $candidate);
                $this->recordUsage($candidate, $user, $chat, $feature, $tokensIn, $tokensOut, $started, $index > 0 ? 'fallback' : 'ok');

                return $result;
            } catch (AiException $e) {
                $this->recordError($candidate, $user, $feature, $e);
                $last = $e;

                if (! $e->retryable) {
                    break;
                }
            }
        }

        throw $last ?? new AiException('Kein verfügbares Modell für diese Anfrage.', null, false);
    }

    public function estimate(string $text): int
    {
        return (int) ceil(mb_strlen($text) / 4);
    }

    private function recordUsage(AiModel $model, ?User $user, ?Chat $chat, string $feature, int $in, int $out, float $startedAt, string $status): void
    {
        UsageLog::create([
            'user_id' => $user?->id,
            'provider_id' => $model->provider_id,
            'ai_model_id' => $model->id,
            'chat_id' => $chat?->id,
            'feature' => $feature,
            'tokens_in' => $in,
            'tokens_out' => $out,
            'cost' => $model->calculateCost($in, $out),
            'latency_ms' => (int) ((microtime(true) - $startedAt) * 1000),
            'status' => $status,
        ]);
    }

    private function recordError(AiModel $model, ?User $user, string $feature, AiException $e): void
    {
        ErrorLog::create([
            'user_id' => $user?->id,
            'provider_id' => $model->provider_id,
            'ai_model_id' => $model->id,
            'feature' => $feature,
            'http_status' => $e->status,
            'message' => mb_substr($e->getMessage(), 0, 1000),
            'context' => ['body' => $e->providerBody, 'retryable' => $e->retryable],
        ]);
    }
}
