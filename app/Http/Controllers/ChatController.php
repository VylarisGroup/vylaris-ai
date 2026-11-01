<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\AiModel;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Models\UserFile;
use App\Services\Ai\ChatRunner;
use App\Services\Ai\ModelRouter;
use App\Services\Features\FeatureManager;
use App\Services\Files\DocumentBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    public function __construct(private ChatRunner $runner, private ModelRouter $router) {}

    public function index(Request $request): Response
    {
        return $this->render($request, null);
    }

    public function show(Request $request, Chat $chat): Response
    {
        Gate::authorize('view', $chat);

        return $this->render($request, $chat);
    }

    private function render(Request $request, ?Chat $chat): Response
    {
        $user = $request->user();

        return Inertia::render('Chat/Index', [
            'chat' => $chat ? $this->serializeChat($chat) : null,
            'messages' => $chat ? $chat->messages()->with(['files', 'model'])->get()->map(fn (Message $m) => $this->serializeMessage($m, $user))->values() : [],
            'sidebar' => $this->sidebar($user),
            'models' => $this->models(),
            'agents' => Agent::where('is_enabled', true)->get(['id', 'name', 'description']),
            'voice' => $this->voiceConfig(),
            'newChat' => [
                'project_id' => $chat ? null : ((int) $request->query('project') ?: null),
                'folder_id' => $chat ? null : ((int) $request->query('folder') ?: null),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function sidebar(User $user): array
    {
        return [
            'chats' => $user->chats()
                ->orderByDesc('last_message_at')->orderByDesc('id')
                ->limit(500)
                ->get(['id', 'title', 'is_favorite', 'archived_at', 'folder_id', 'project_id', 'last_message_at', 'created_at'])
                ->map(fn (Chat $c) => ['id' => $c->id, 'title' => $c->title, 'is_favorite' => $c->is_favorite, 'archived' => $c->archived_at !== null, 'folder_id' => $c->folder_id, 'project_id' => $c->project_id, 'updated_at' => ($c->last_message_at ?? $c->created_at)?->toIso8601String()]),
            'folders' => $user->folders()->orderBy('sort')->orderBy('name')->get(['id', 'name']),
            'projects' => $user->projects()->whereNull('archived_at')->orderBy('name')->get(['id', 'name']),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function models(): array
    {
        return $this->router->chatModels(request()->user())->map(fn (AiModel $m) => [
            'id' => $m->id,
            'name' => $m->display_name,
            'provider' => $m->provider->name,
            'tier' => $m->tier,
            'is_default' => $m->is_default,
            'capabilities' => $m->capabilities->pluck('capability')->values(),
            'allowed_parameters' => $m->allowed_parameters ?? ['temperature', 'top_p', 'max_tokens'],
            'defaults' => collect($m->parameters ?? [])->reject(fn ($v, $k) => str_starts_with($k, '_'))->all(),
        ])->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function voiceConfig(): array
    {
        $features = app(FeatureManager::class);
        $tts = $features->config('tts');
        $stt = $features->config('stt');

        return [
            'tts_voices' => $tts['voices'] ?? [],
            'tts_formats' => $tts['formats'] ?? ['mp3'],
            'tts_speeds' => [$tts['min_speed'] ?? 0.5, $tts['max_speed'] ?? 2.0],
            'languages' => $stt['languages'] ?? ['de', 'en'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeChat(Chat $chat): array
    {
        return [
            'id' => $chat->id,
            'title' => $chat->title,
            'is_favorite' => $chat->is_favorite,
            'archived' => $chat->archived_at !== null,
            'folder_id' => $chat->folder_id,
            'project_id' => $chat->project_id,
            'project' => $chat->project?->only(['id', 'name']),
            'ai_model_id' => $chat->ai_model_id,
            'instructions' => $chat->instructions,
            'parameters' => $chat->parameters ?? (object) [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeMessage(Message $m, User $user): array
    {
        $generated = $m->generated
            ? UserFile::whereIn('id', $m->generated)->where('user_id', $user->id)->get()->map(fn (UserFile $f) => $this->fileInfo($f))->values()
            : [];

        return [
            'id' => $m->id,
            'role' => $m->role,
            'content' => $m->content,
            'reasoning' => $m->reasoning,
            'sources' => $m->sources ?? [],
            'tool_events' => $m->tool_events ?? [],
            'generated' => $generated,
            'files' => $m->files->map(fn (UserFile $f) => $this->fileInfo($f))->values(),
            'rating' => $m->rating,
            'status' => $m->status,
            'error' => $m->error,
            'model' => $m->model?->display_name,
            'tokens_in' => $m->tokens_in,
            'tokens_out' => $m->tokens_out,
            'created_at' => $m->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function fileInfo(UserFile $f): array
    {
        return ['id' => $f->id, 'name' => $f->original_name, 'mime' => $f->mime, 'kind' => $f->kind, 'size' => $f->size, 'status' => $f->status];
    }

    public function update(Request $request, Chat $chat): JsonResponse
    {
        Gate::authorize('update', $chat);
        $user = $request->user();

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:120'],
            'folder_id' => ['sometimes', 'nullable', Rule::exists('folders', 'id')->where('user_id', $user->id)],
            'project_id' => ['sometimes', 'nullable', Rule::exists('projects', 'id')->where('user_id', $user->id)],
            'is_favorite' => ['sometimes', 'boolean'],
            'archived' => ['sometimes', 'boolean'],
            'ai_model_id' => ['sometimes', 'nullable', 'integer', 'exists:ai_models,id'],
            'instructions' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'parameters' => ['sometimes', 'nullable', 'array'],
        ]);

        if (array_key_exists('archived', $data)) {
            $data['archived_at'] = $data['archived'] ? now() : null;
            unset($data['archived']);
        }

        $chat->update($data);

        return response()->json($this->serializeChat($chat->fresh()));
    }

    public function destroy(Chat $chat): JsonResponse
    {
        Gate::authorize('delete', $chat);

        $chat->files()->whereNull('project_id')->get()->each->delete();
        $chat->delete();

        return response()->json(['ok' => true]);
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';

        $chats = $request->user()->chats()
            ->where(fn ($query) => $query
                ->where('title', 'like', $like)
                ->orWhereHas('messages', fn ($m) => $m->where('content', 'like', $like)))
            ->orderByDesc('last_message_at')
            ->limit(30)
            ->get();

        return response()->json($chats->map(function (Chat $chat) use ($like, $q) {
            $hit = $chat->messages()->where('content', 'like', $like)->first();
            $snippet = null;

            if ($hit) {
                $pos = mb_stripos($hit->content, $q);
                $snippet = ($pos > 40 ? '…' : '').mb_substr($hit->content, max(0, $pos - 40), 120).'…';
            }

            return ['id' => $chat->id, 'title' => $chat->title, 'snippet' => $snippet, 'archived' => $chat->archived_at !== null];
        }));
    }

    public function rate(Request $request, Message $message): JsonResponse
    {
        Gate::authorize('update', $message);

        $data = $request->validate([
            'rating' => ['nullable', Rule::in(['up', 'down'])],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        abort_unless($message->role === 'assistant', 422);
        $message->update(['rating' => $data['rating'], 'rating_comment' => $data['comment'] ?? null]);

        return response()->json(['rating' => $message->rating]);
    }

    public function export(Request $request, Message $message): JsonResponse
    {
        Gate::authorize('view', $message);
        $user = $request->user();
        abort_unless(app(FeatureManager::class)->enabled('documents', $user), 403, 'Dokumentenerstellung ist nicht verfügbar.');

        $data = $request->validate(['format' => ['required', Rule::in(DocumentBuilder::FORMATS)], 'title' => ['nullable', 'string', 'max:120']]);

        $file = app(DocumentBuilder::class)->build($user, $data['title'] ?? $message->chat->title, $data['format'], (string) $message->content, $message->chat);

        return response()->json($this->fileInfo($file));
    }

    /**
     * Neue Benutzernachricht senden und die Antwort als Server-Sent-Events streamen.
     */
    public function stream(Request $request): StreamedResponse|JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasPermission('chat.use'), 403);

        $data = $request->validate([
            'content' => ['nullable', 'string', 'max:50000', 'required_without:file_ids'],
            'chat_id' => ['nullable', Rule::exists('chats', 'id')->where('user_id', $user->id)],
            'project_id' => ['nullable', Rule::exists('projects', 'id')->where('user_id', $user->id)],
            'folder_id' => ['nullable', Rule::exists('folders', 'id')->where('user_id', $user->id)],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'file_ids' => ['nullable', 'array', 'max:20', 'required_without:content'],
            'file_ids.*' => ['integer', Rule::exists('files', 'id')->where('user_id', $user->id)],
            'web_search' => ['nullable', 'boolean'],
            'image_mode' => ['nullable', 'boolean'],
            'agent_id' => ['nullable', 'integer', 'exists:agents,id'],
            'parameters' => ['nullable', 'array'],
        ]);

        $chat = isset($data['chat_id'])
            ? Chat::findOrFail($data['chat_id'])
            : $user->chats()->create([
                'title' => 'Neuer Chat',
                'project_id' => $data['project_id'] ?? null,
                'folder_id' => $data['folder_id'] ?? null,
                'last_message_at' => now(),
            ]);

        Gate::authorize('update', $chat);

        if (array_key_exists('model_id', $data)) {
            $chat->update(['ai_model_id' => $data['model_id']]);
        }

        $message = $chat->messages()->create(['role' => 'user', 'content' => $data['content'] ?? '', 'status' => 'done']);

        if (! empty($data['file_ids'])) {
            $files = UserFile::where('user_id', $user->id)->whereIn('id', $data['file_ids'])->get();
            abort_unless($user->hasPermission('files.upload') || $files->isEmpty(), 403);
            $message->files()->attach($files->pluck('id'));
            $files->each(fn (UserFile $f) => $f->chat_id === null && $f->project_id === null ? $f->update(['chat_id' => $chat->id]) : null);
        }

        if ($chat->title === 'Neuer Chat') {
            $chat->update(['title' => mb_substr(trim(preg_replace('/\s+/', ' ', ($data['content'] ?? '') ?: 'Dateianalyse')), 0, 60)]);
        }

        return $this->streamRun($chat, $user, $message, $data, true);
    }

    public function regenerate(Request $request, Chat $chat): StreamedResponse|JsonResponse
    {
        Gate::authorize('update', $chat);
        $data = $request->validate([
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'web_search' => ['nullable', 'boolean'],
            'agent_id' => ['nullable', 'integer', 'exists:agents,id'],
            'parameters' => ['nullable', 'array'],
        ]);

        $lastUser = $chat->messages()->where('role', 'user')->latest('id')->first();
        abort_unless($lastUser, 422, 'Keine Nachricht zum Regenerieren.');

        $chat->messages()->where('id', '>', $lastUser->id)->delete();

        if (array_key_exists('model_id', $data)) {
            $chat->update(['ai_model_id' => $data['model_id']]);
        }

        return $this->streamRun($chat, $request->user(), $lastUser, $data, false);
    }

    public function edit(Request $request, Message $message): StreamedResponse|JsonResponse
    {
        Gate::authorize('update', $message);
        abort_unless($message->role === 'user', 422);

        $data = $request->validate([
            'content' => ['required', 'string', 'max:50000'],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'web_search' => ['nullable', 'boolean'],
            'agent_id' => ['nullable', 'integer', 'exists:agents,id'],
            'parameters' => ['nullable', 'array'],
        ]);

        $chat = $message->chat;
        $chat->messages()->where('id', '>', $message->id)->delete();
        $message->update(['content' => $data['content']]);

        if (array_key_exists('model_id', $data)) {
            $chat->update(['ai_model_id' => $data['model_id']]);
        }

        return $this->streamRun($chat, $request->user(), $message, $data, false);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function streamRun(Chat $chat, User $user, Message $message, array $data, bool $announceChat): StreamedResponse
    {
        $request = request();
        $request->session()->save();
        ignore_user_abort(true);
        set_time_limit(0);

        $options = [
            'web_search' => (bool) ($data['web_search'] ?? false),
            'image_mode' => (bool) ($data['image_mode'] ?? false),
            'agent_id' => $data['agent_id'] ?? null,
            'parameters' => $data['parameters'] ?? $chat->parameters ?? [],
        ];

        return response()->stream(function () use ($chat, $user, $message, $options, $announceChat) {
            $send = function (array $event) {
                echo 'data: '.json_encode($event, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n\n";

                if (app()->runningUnitTests()) {
                    return;
                }

                if (ob_get_level() > 0) {
                    @ob_flush();
                }

                flush();
            };

            $send(['type' => 'open', 'chat' => ['id' => $chat->id, 'title' => $chat->title, 'is_new' => $announceChat], 'user_message_id' => $message->id]);

            foreach ($this->runner->run($chat, $user, $message, $options, fn () => connection_aborted()) as $event) {
                $send($event);
            }

            $send(['type' => 'end', 'title' => $chat->fresh()->title]);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Aktuellen Titel nachladen (nach asynchroner Titelgenerierung).
     */
    public function title(Chat $chat): JsonResponse
    {
        Gate::authorize('view', $chat);

        return response()->json(['title' => $chat->title]);
    }
}
