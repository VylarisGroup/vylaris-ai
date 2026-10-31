<?php

namespace App\Services\Ai;

use App\Models\AiModel;
use App\Models\Provider;
use Generator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Standardkonformer Client für OpenAI-kompatible Endpunkte (inkl. Azure OpenAI).
 * Es werden ausschliesslich externe APIs angesprochen.
 */
class ProviderClient
{
    public function __construct(public readonly Provider $provider) {}

    private function http(): PendingRequest
    {
        $headers = $this->provider->extra_headers ?? [];

        if ($this->provider->driver === 'azure_openai') {
            $headers['api-key'] = $this->provider->api_key ?? '';
        } elseif ($this->provider->api_key) {
            $headers['Authorization'] = 'Bearer '.$this->provider->api_key;
        }

        return Http::withHeaders($headers)
            ->timeout($this->provider->timeout ?: 120)
            ->connectTimeout(15);
    }

    public function endpoint(string $path, AiModel $model): string
    {
        $base = rtrim($this->provider->base_url, '/');

        if ($this->provider->driver === 'azure_openai') {
            $deployment = rawurlencode($model->model_id);
            $version = rawurlencode($this->provider->api_version ?: '2024-10-21');

            return "{$base}/openai/deployments/{$deployment}/{$path}?api-version={$version}";
        }

        return "{$base}/{$path}";
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function prepare(array $payload, AiModel $model): array
    {
        $payload = array_filter($payload, fn ($value, $key) => ! str_starts_with((string) $key, '_') && $value !== null, ARRAY_FILTER_USE_BOTH);

        if ($this->provider->driver !== 'azure_openai') {
            $payload['model'] = $model->model_id;
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function chat(AiModel $model, array $payload): array
    {
        $response = $this->send(fn () => $this->http()->acceptJson()->post($this->endpoint('chat/completions', $model), $this->prepare($payload, $model)));

        return $response->json() ?? [];
    }

    /**
     * Liefert normalisierte Ereignisse:
     * ['type' => 'delta', 'text' => ...], ['type' => 'reasoning', 'text' => ...],
     * ['type' => 'tool_calls', 'calls' => [...]], ['type' => 'usage', 'in' => n, 'out' => n], ['type' => 'finish', 'reason' => ...]
     *
     * @param  array<string, mixed>  $payload
     * @return Generator<int, array<string, mixed>>
     */
    public function chatStream(AiModel $model, array $payload): Generator
    {
        $payload['stream'] = true;

        if (($model->parameters['_stream_usage'] ?? true) && $this->provider->driver !== 'azure_openai') {
            $payload['stream_options'] = ['include_usage' => true];
        }

        $response = $this->send(fn () => $this->http()
            ->withOptions(['stream' => true])
            ->withHeaders(['Accept' => 'text/event-stream'])
            ->post($this->endpoint('chat/completions', $model), $this->prepare($payload, $model)));

        $body = $response->toPsrResponse()->getBody();
        $buffer = '';
        $toolCalls = [];
        $finish = null;

        while (! $body->eof()) {
            $chunk = $body->read(2048);

            if ($chunk === '') {
                continue;
            }

            $buffer .= $chunk;

            while (($pos = strpos($buffer, "\n")) !== false) {
                $line = trim(substr($buffer, 0, $pos));
                $buffer = substr($buffer, $pos + 1);

                if ($line === '' || str_starts_with($line, ':') || ! str_starts_with($line, 'data:')) {
                    continue;
                }

                $data = trim(substr($line, 5));

                if ($data === '[DONE]') {
                    break 2;
                }

                $json = json_decode($data, true);

                if (! is_array($json)) {
                    continue;
                }

                if (isset($json['error'])) {
                    $message = is_array($json['error']) ? ($json['error']['message'] ?? 'Unbekannter Fehler') : (string) $json['error'];

                    throw new AiException($message, null, true);
                }

                if (! empty($json['usage'])) {
                    yield ['type' => 'usage', 'in' => (int) ($json['usage']['prompt_tokens'] ?? 0), 'out' => (int) ($json['usage']['completion_tokens'] ?? 0)];
                }

                $choice = $json['choices'][0] ?? null;

                if (! $choice) {
                    continue;
                }

                $delta = $choice['delta'] ?? [];

                if (isset($delta['content']) && $delta['content'] !== '') {
                    yield ['type' => 'delta', 'text' => $delta['content']];
                }

                $reasoning = $delta['reasoning_content'] ?? $delta['reasoning'] ?? null;

                if (is_string($reasoning) && $reasoning !== '') {
                    yield ['type' => 'reasoning', 'text' => $reasoning];
                }

                foreach ($delta['tool_calls'] ?? [] as $call) {
                    $index = $call['index'] ?? 0;
                    $toolCalls[$index] ??= ['id' => '', 'name' => '', 'arguments' => ''];

                    if (! empty($call['id'])) {
                        $toolCalls[$index]['id'] = $call['id'];
                    }

                    if (! empty($call['function']['name'])) {
                        $toolCalls[$index]['name'] .= $call['function']['name'];
                    }

                    $toolCalls[$index]['arguments'] .= $call['function']['arguments'] ?? '';
                }

                if (! empty($choice['finish_reason'])) {
                    $finish = $choice['finish_reason'];
                }
            }
        }

        if ($toolCalls !== []) {
            ksort($toolCalls);
            yield ['type' => 'tool_calls', 'calls' => array_values($toolCalls)];
        }

        yield ['type' => 'finish', 'reason' => $finish];
    }

    public function transcribe(AiModel $model, string $path, string $filename, ?string $language = null, ?string $prompt = null): string
    {
        $request = $this->http()->attach('file', fopen($path, 'r'), $filename);

        $fields = ['response_format' => 'json'];

        if ($this->provider->driver !== 'azure_openai') {
            $fields['model'] = $model->model_id;
        }

        if ($language) {
            $fields['language'] = $language;
        }

        if ($prompt) {
            $fields['prompt'] = $prompt;
        }

        $response = $this->send(fn () => $request->post($this->endpoint('audio/transcriptions', $model), $fields));

        return (string) ($response->json('text') ?? '');
    }

    /**
     * @return array{body: string, mime: string}
     */
    public function speech(AiModel $model, string $text, string $voice, string $format = 'mp3', float $speed = 1.0): array
    {
        $payload = $this->prepare([
            'input' => $text,
            'voice' => $voice,
            'response_format' => $format,
            'speed' => $speed,
        ], $model);

        $response = $this->send(fn () => $this->http()->post($this->endpoint('audio/speech', $model), $payload));

        return [
            'body' => $response->body(),
            'mime' => $response->header('Content-Type') ?: self::mimeForFormat($format),
        ];
    }

    public static function mimeForFormat(string $format): string
    {
        return match ($format) {
            'opus' => 'audio/ogg',
            'aac' => 'audio/aac',
            'flac' => 'audio/flac',
            'wav' => 'audio/wav',
            'pcm' => 'audio/L16',
            default => 'audio/mpeg',
        };
    }

    /**
     * @return array<int, array{b64: ?string, url: ?string, revised_prompt: ?string}>
     */
    public function generateImage(AiModel $model, string $prompt, string $size = '1024x1024', int $count = 1): array
    {
        $payload = $this->prepare(['prompt' => $prompt, 'n' => $count, 'size' => $size], $model);

        $response = $this->send(fn () => $this->http()->acceptJson()->post($this->endpoint('images/generations', $model), $payload));

        return array_map(fn ($item) => [
            'b64' => $item['b64_json'] ?? null,
            'url' => $item['url'] ?? null,
            'revised_prompt' => $item['revised_prompt'] ?? null,
        ], $response->json('data') ?? []);
    }

    /**
     * @param  array<int, string>  $inputs
     * @return array<int, array<int, float>>
     */
    public function embeddings(AiModel $model, array $inputs): array
    {
        $payload = $this->prepare(['input' => array_values($inputs)], $model);

        $response = $this->send(fn () => $this->http()->acceptJson()->post($this->endpoint('embeddings', $model), $payload));

        return array_map(fn ($item) => $item['embedding'], $response->json('data') ?? []);
    }

    /**
     * Listet die vom Anbieter angebotenen Modelle (OpenAI-kompatibles /models), soweit unterstützt.
     *
     * @return array<int, string>
     */
    public function listModels(): array
    {
        if ($this->provider->driver === 'azure_openai') {
            throw new AiException('Azure OpenAI listet Deployments nicht über diese Schnittstelle. Bitte Deployment-Namen manuell eintragen.', null, false);
        }

        $response = $this->send(fn () => $this->http()->acceptJson()->get(rtrim($this->provider->base_url, '/').'/models'));

        return collect($response->json('data') ?? [])->pluck('id')->filter()->sort()->values()->all();
    }

    /**
     * Prüft die Erreichbarkeit mit einer minimalen Anfrage (Admin-Verbindungstest).
     */
    public function ping(AiModel $model): void
    {
        $this->chat($model, ['messages' => [['role' => 'user', 'content' => 'ping']], 'max_tokens' => 5]);
    }

    /**
     * @param  callable(): Response  $callback
     */
    private function send(callable $callback): Response
    {
        try {
            $response = $callback();
        } catch (ConnectionException $e) {
            throw new AiException('Verbindungsfehler: '.$e->getMessage(), null, true);
        }

        if ($response->failed()) {
            $status = $response->status();
            $message = $response->json('error.message') ?? $response->json('error') ?? $response->json('message') ?? 'HTTP '.$status;

            if (! is_string($message)) {
                $message = json_encode($message);
            }

            throw new AiException($message, $status, in_array($status, [401, 403, 404, 408, 409, 425, 429], true) || $status >= 500, mb_substr($response->body(), 0, 2000));
        }

        return $response;
    }
}
