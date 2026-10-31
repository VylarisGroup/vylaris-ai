<?php

namespace App\Services\Ai;

use App\Models\AiModel;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Services\Features\FeatureManager;
use App\Services\Files\KnowledgeRetriever;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Storage;

/**
 * Baut den vollständigen Nachrichtenkontext (System-Prompt, Memory, RAG, Dateien, Verlauf).
 */
class ChatContextBuilder
{
    public const PER_FILE_CHARS = 30000;

    public const HISTORY_CHARS = 120000;

    public function __construct(
        private SettingsService $settings,
        private FeatureManager $features,
        private KnowledgeRetriever $retriever,
    ) {}

    /**
     * @param  array<string, mixed>  $options  web_sources (array), agent_instructions (string)
     * @return array<int, array<string, mixed>>
     */
    public function build(Chat $chat, User $user, AiModel $model, Message $latestUser, array $options = []): array
    {
        $messages = [['role' => 'system', 'content' => $this->systemPrompt($chat, $user, $latestUser, $options)]];

        $history = $chat->messages()
            ->with('files')
            ->where('id', '<=', $latestUser->id)
            ->whereIn('role', ['user', 'assistant'])
            ->where('status', '!=', 'error')
            ->get();

        $budget = self::HISTORY_CHARS;
        $selected = [];

        foreach ($history->reverse() as $message) {
            $size = mb_strlen((string) $message->content);

            if ($budget - $size < 0 && $selected !== []) {
                break;
            }

            $budget -= $size;
            $selected[] = $message;
        }

        foreach (array_reverse($selected) as $message) {
            if ($message->role === 'assistant') {
                if (trim((string) $message->content) !== '') {
                    $messages[] = ['role' => 'assistant', 'content' => $message->content];
                }

                continue;
            }

            $messages[] = ['role' => 'user', 'content' => $this->userContent($message, $user, $model, $message->id === $latestUser->id)];
        }

        return $messages;
    }

    /**
     * @param  array<string, mixed>  $options
     */
    private function systemPrompt(Chat $chat, User $user, Message $latestUser, array $options): string
    {
        $parts = [];
        $parts[] = 'Du bist ein hilfreicher KI-Assistent der Plattform "'.$this->settings->get('site_name', 'Vylaris AI').'". Antworte in der Sprache des Benutzers, präzise und in Markdown. Erfinde keine Quellen oder Fakten; sage, wenn du etwas nicht weisst. Heutiges Datum: '.now()->translatedFormat('d.m.Y').'.';

        if ($global = trim((string) $this->settings->get('global_instructions', ''))) {
            $parts[] = "Globale Vorgaben der Plattform:\n".$global;
        }

        if ($user->about_me) {
            $parts[] = "Über den Benutzer:\n".$user->about_me;
        }

        if ($user->custom_instructions) {
            $parts[] = "Persönliche Instructions des Benutzers:\n".$user->custom_instructions;
        }

        if ($chat->project) {
            $parts[] = 'Projekt "'.$chat->project->name.'"'.($chat->project->instructions ? ":\n".$chat->project->instructions : '');
        }

        if ($chat->instructions) {
            $parts[] = "Instructions für diesen Chat:\n".$chat->instructions;
        }

        if (! empty($options['agent_instructions'])) {
            $parts[] = "Agentenrolle:\n".$options['agent_instructions'];
        }

        if ($this->features->enabled('memory', $user) && ($memories = $user->memories()->latest()->limit(50)->pluck('content'))->isNotEmpty()) {
            $parts[] = "Gespeicherte Informationen über den Benutzer (Memory):\n- ".$memories->implode("\n- ");
        }

        if ($chat->project_id && $this->features->enabled('rag', $user)) {
            $config = $this->features->config('rag');
            $hits = $this->retriever->search($user, $chat->project_id, (string) $latestUser->content, (int) ($config['top_k'] ?? 5));

            if ($hits->isNotEmpty()) {
                $block = $hits->map(fn ($h, $i) => '['.($i + 1)."] Datei {$h['file']}:\n".$h['content'])->implode("\n\n");
                $parts[] = "Auszüge aus der Projekt-Wissensdatenbank (nutze sie, wenn relevant, und nenne die Datei):\n".$block;
            }
        }

        if (! empty($options['web_sources'])) {
            $block = collect($options['web_sources'])->map(fn ($s, $i) => '['.($i + 1)."] {$s['title']} ({$s['url']})\n{$s['snippet']}")->implode("\n\n");
            $parts[] = "Aktuelle Websuche-Ergebnisse. Stütze dich darauf und zitiere im Text mit [1], [2] usw.; nenne keine Quellen, die hier nicht stehen:\n".$block;
        }

        return implode("\n\n", $parts);
    }

    /**
     * @return string|array<int, array<string, mixed>>
     */
    private function userContent(Message $message, User $user, AiModel $model, bool $isLatest): string|array
    {
        $text = (string) $message->content;
        $images = [];

        foreach ($message->files as $file) {
            if ($file->kind === 'image') {
                if ($isLatest && $model->hasCapability('vision') && $file->size <= 10 * 1024 * 1024) {
                    $images[] = ['type' => 'image_url', 'image_url' => ['url' => 'data:'.$file->mime.';base64,'.base64_encode(Storage::disk($file->disk)->get($file->path))]];
                } else {
                    $text .= "\n\n[Bildanhang: {$file->original_name}]";
                }

                continue;
            }

            if (! $isLatest) {
                $text .= "\n\n[Anhang: {$file->original_name} (file_id {$file->id})]";

                continue;
            }

            if ($file->status !== 'ready') {
                $text .= "\n\n[Anhang {$file->original_name}: Verarbeitung noch nicht abgeschlossen oder fehlgeschlagen]";

                continue;
            }

            $content = (string) $file->extracted_text;

            if (mb_strlen($content) > self::PER_FILE_CHARS) {
                $hits = $this->retriever->search($user, $file->project_id, (string) $message->content ?: $file->original_name, 6, [$file->id]);
                $content = $hits->isNotEmpty()
                    ? $hits->pluck('content')->implode("\n---\n")."\n\n[Auszug – die Datei ist lang. Vollständiger Text über das Tool read_file (file_id {$file->id}).]"
                    : mb_substr($content, 0, self::PER_FILE_CHARS)."\n\n[gekürzt – weiterlesen mit Tool read_file, file_id {$file->id}]";
            }

            $text .= "\n\n--- Datei: {$file->original_name} (file_id {$file->id}) ---\n".$content."\n--- Ende Datei ---";
        }

        if ($images === []) {
            return $text;
        }

        return [['type' => 'text', 'text' => $text === '' ? 'Beschreibe das Bild.' : $text], ...$images];
    }
}
