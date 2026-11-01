<?php

namespace App\Services\Ai;

use App\Jobs\ExtractMemoriesJob;
use App\Jobs\GenerateChatTitleJob;
use App\Models\Agent;
use App\Models\AgentRun;
use App\Models\AiModel;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Models\UserFile;
use App\Services\Features\FeatureManager;
use App\Services\Features\UsageLimiter;
use App\Services\Features\WebSearchService;
use App\Services\Tools\Tool;
use App\Services\Tools\ToolContext;
use App\Services\Tools\ToolRegistry;
use App\Services\Tools\ToolResult;
use Generator;
use Illuminate\Support\Facades\Log;

/**
 * Führt eine Chat-Antwort aus: Modellwahl, Kontext, Websuche, Streaming, Tool-Schleife (Agenten), Persistenz.
 * Liefert Ereignisse, die der Controller als Server-Sent Events ausgibt.
 */
class ChatRunner
{
    public function __construct(
        private AiGateway $gateway,
        private ModelRouter $router,
        private ChatContextBuilder $context,
        private ToolRegistry $tools,
        private FeatureManager $features,
        private WebSearchService $search,
        private UsageLimiter $limiter,
    ) {}

    /**
     * @param  array{web_search?: bool, agent_id?: int|null, parameters?: array<string, mixed>}  $options
     * @return Generator<int, array<string, mixed>>
     */
    public function run(Chat $chat, User $user, Message $userMessage, array $options, callable $shouldStop): Generator
    {
        try {
            $this->limiter->assertCanSendMessage($user);
        } catch (\RuntimeException $e) {
            yield ['type' => 'error', 'message' => $e->getMessage()];

            return;
        }

        $userMessage->loadMissing('files');
        $needsVision = $userMessage->files->contains('kind', 'image');
        $agent = $this->resolveAgent($options['agent_id'] ?? null, $user);
        $selected = $agent?->model ?? $chat->model;

        ['model' => $model, 'notice' => $notice] = $this->router->resolve($selected, ['vision' => $needsVision], (string) $userMessage->content, $user);

        if (! $model) {
            yield ['type' => 'error', 'message' => $notice ?? 'Es ist kein Chat-Modell konfiguriert. Bitte den Administrator informieren.'];

            return;
        }

        if ($notice) {
            yield ['type' => 'notice', 'message' => $notice];
        }

        $context = new ToolContext($user, $chat);
        $toolSet = $this->toolSet($model, $context, $agent);
        $webSources = [];

        if (! empty($options['web_search'])) {
            if ($this->features->status('web_search', $user)['configured']) {
                try {
                    yield ['type' => 'tool', 'name' => 'web_search', 'status' => 'running', 'summary' => 'Websuche'];
                    $webSources = $this->search->search(mb_substr((string) $userMessage->content, 0, 400));
                    yield ['type' => 'tool', 'name' => 'web_search', 'status' => 'done', 'summary' => count($webSources).' Quellen gefunden'];
                } catch (\Throwable $e) {
                    Log::warning('Websuche fehlgeschlagen: '.$e->getMessage());
                    yield ['type' => 'notice', 'message' => 'Die Websuche ist fehlgeschlagen; Antwort ohne aktuelle Quellen.'];
                }
            } else {
                yield ['type' => 'notice', 'message' => 'Websuche ist nicht konfiguriert oder nicht freigegeben.'];
            }
        }

        $agentInstructions = $agent?->instructions;

        if (! empty($options['image_mode'])) {
            if (isset($toolSet['generate_image'])) {
                $agentInstructions = trim(($agentInstructions ? $agentInstructions."\n\n" : '').'Der Benutzer möchte ein Bild erzeugen. Rufe zwingend das Werkzeug generate_image mit einem passenden, detaillierten Prompt auf und beschreibe das Ergebnis danach kurz.');
            } else {
                yield ['type' => 'notice', 'message' => 'Bildgenerierung ist nicht konfiguriert oder für diese Anfrage nicht verfügbar.'];
            }
        }

        $messages = $this->context->build($chat, $user, $model, $userMessage, ['web_sources' => $webSources, 'agent_instructions' => $agentInstructions]);
        $overrides = $this->gateway->sanitizeParameters($model, $options['parameters'] ?? $chat->parameters ?? []);

        $assistant = $chat->messages()->create([
            'role' => 'assistant',
            'ai_model_id' => $model->id,
            'status' => 'streaming',
            'sources' => $webSources ?: null,
        ]);

        $run = $agent ? AgentRun::create(['user_id' => $user->id, 'agent_id' => $agent->id, 'chat_id' => $chat->id, 'goal' => mb_substr((string) $userMessage->content, 0, 2000), 'status' => 'running']) : null;

        yield ['type' => 'meta', 'message_id' => $assistant->id, 'user_message_id' => $userMessage->id, 'model' => ['id' => $model->id, 'name' => $model->display_name]];

        if ($webSources) {
            yield ['type' => 'sources', 'sources' => $webSources];
        }

        $maxSteps = $toolSet ? max(1, min(20, $agent?->max_steps ?? (int) ($this->features->config('agents')['max_steps'] ?? 8))) : 1;
        $content = '';
        $reasoning = '';
        $sources = $webSources;
        $events = [];
        $generated = [];
        $in = 0;
        $out = 0;
        $usedModel = $model;
        $status = 'done';
        $error = null;
        $required = $needsVision ? ['chat', 'vision'] : ['chat'];

        try {
            for ($step = 1; $step <= $maxSteps; $step++) {
                $definitions = ($toolSet && $step < $maxSteps) ? array_values(array_map(fn ($t) => $t->definition(), $toolSet)) : null;
                $calls = [];
                $stepText = '';

                foreach ($this->gateway->stream($model, $messages, $overrides, $definitions, $required, $user, $chat) as $event) {
                    if ($shouldStop()) {
                        $status = 'stopped';
                        break 2;
                    }

                    switch ($event['type']) {
                        case 'start':
                            $usedModel = $event['model'];

                            if ($event['fallback']) {
                                yield ['type' => 'notice', 'message' => "Wechsel zum Fallback-Modell {$usedModel->display_name}."];
                                $assistant->update(['ai_model_id' => $usedModel->id]);
                            }
                            break;
                        case 'delta':
                            $content .= $event['text'];
                            $stepText .= $event['text'];
                            yield ['type' => 'delta', 'text' => $event['text']];
                            break;
                        case 'reasoning':
                            $reasoning .= $event['text'];
                            yield ['type' => 'reasoning', 'text' => $event['text']];
                            break;
                        case 'tool_calls':
                            $calls = $event['calls'];
                            break;
                        case 'usage':
                            $in += $event['in'];
                            $out += $event['out'];
                            break;
                    }
                }

                if ($calls === [] || $definitions === null) {
                    break;
                }

                $messages[] = [
                    'role' => 'assistant',
                    'content' => $stepText !== '' ? $stepText : null,
                    'tool_calls' => array_map(fn ($c) => ['id' => $c['id'], 'type' => 'function', 'function' => ['name' => $c['name'], 'arguments' => $c['arguments'] ?: '{}']], $calls),
                ];

                foreach ($calls as $call) {
                    $tool = $toolSet[$call['name']] ?? null;
                    $arguments = json_decode($call['arguments'] ?: '{}', true) ?: [];
                    yield ['type' => 'tool', 'name' => $call['name'], 'status' => 'running', 'summary' => $tool?->label() ?? $call['name']];

                    if (! $tool) {
                        $result = new ToolResult('Unbekanntes oder nicht verfügbares Tool.');
                    } else {
                        try {
                            $result = $tool->run($arguments, $context);
                        } catch (\Throwable $e) {
                            Log::warning("Tool {$call['name']} fehlgeschlagen: ".$e->getMessage());
                            $result = new ToolResult('Das Tool ist fehlgeschlagen.');
                        }
                    }

                    $resultText = $result->content;

                    if ($result->sources) {
                        $offset = count($sources);
                        $resultText = preg_replace_callback('/^\[(\d+)\]/m', fn ($m) => '['.($m[1] + $offset).']', $resultText);
                        $sources = array_merge($sources, $result->sources);
                        yield ['type' => 'sources', 'sources' => $sources];
                    }

                    foreach ($result->generatedFileIds as $fileId) {
                        $generated[] = $fileId;
                    }

                    if ($result->generatedFileIds) {
                        yield ['type' => 'generated', 'files' => $this->fileInfo($result->generatedFileIds, $user)];
                    }

                    $events[] = ['tool' => $call['name'], 'summary' => $result->summary ?: ($tool?->label() ?? $call['name']), 'step' => $step];
                    yield ['type' => 'tool', 'name' => $call['name'], 'status' => 'done', 'summary' => $result->summary ?: ($tool?->label() ?? $call['name'])];

                    $messages[] = ['role' => 'tool', 'tool_call_id' => $call['id'], 'content' => mb_substr($resultText, 0, 30000)];
                }
            }
        } catch (AiException $e) {
            $status = 'error';
            $error = $e->userMessage();
            yield ['type' => 'error', 'message' => $error];
        } catch (\Throwable $e) {
            Log::error('Chat-Fehler: '.$e->getMessage(), ['exception' => $e]);
            $status = 'error';
            $error = 'Unerwarteter Fehler bei der Verarbeitung.';
            yield ['type' => 'error', 'message' => $error];
        }

        $assistant->update([
            'content' => $content,
            'reasoning' => $reasoning ?: null,
            'sources' => $sources ?: null,
            'tool_events' => $events ?: null,
            'generated' => $generated ?: null,
            'status' => $status,
            'error' => $error,
            'ai_model_id' => $usedModel->id,
            'tokens_in' => $in,
            'tokens_out' => $out,
            'cost' => $usedModel->calculateCost($in, $out),
        ]);

        if ($generated) {
            UserFile::whereIn('id', $generated)->where('user_id', $user->id)->update(['chat_id' => $chat->id]);
        }

        $chat->update(['last_message_at' => now(), 'ai_model_id' => $chat->ai_model_id]);

        if ($run) {
            $run->update(['status' => $status === 'error' ? 'failed' : 'done', 'steps' => $events, 'result' => mb_substr($content, 0, 20000), 'error' => $error]);
        }

        if ($status === 'done' && $content !== '') {
            GenerateChatTitleJob::dispatchIf($chat->messages()->where('role', 'assistant')->count() === 1, $chat->id);
            ExtractMemoriesJob::dispatchIf($this->features->enabled('memory', $user) && ($this->features->config('memory')['auto_extract'] ?? true), $chat->id, $userMessage->id);
        }

        yield ['type' => 'done', 'status' => $status, 'tokens_in' => $in, 'tokens_out' => $out, 'cost' => $assistant->cost];
    }

    private function resolveAgent(?int $agentId, User $user): ?Agent
    {
        if (! $agentId || ! $this->features->enabled('agents', $user)) {
            return null;
        }

        return Agent::where('is_enabled', true)->find($agentId);
    }

    /**
     * @return array<string, Tool>
     */
    private function toolSet(AiModel $model, ToolContext $context, ?Agent $agent): array
    {
        if (! $model->hasCapability('tools')) {
            return [];
        }

        $allowed = $agent ? ($agent->tools ?? []) : null;
        $set = $this->tools->available($context, $allowed);

        if (! $agent) {
            unset($set['web_search']);
        }

        return $set;
    }

    /**
     * @param  array<int, int>  $ids
     * @return array<int, array<string, mixed>>
     */
    public function fileInfo(array $ids, User $user): array
    {
        return UserFile::whereIn('id', $ids)->where('user_id', $user->id)->get()
            ->map(fn (UserFile $f) => ['id' => $f->id, 'name' => $f->original_name, 'mime' => $f->mime, 'kind' => $f->kind, 'size' => $f->size])
            ->all();
    }
}
