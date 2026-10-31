<?php

namespace App\Jobs;

use App\Models\Chat;
use App\Services\Ai\AiException;
use App\Services\Ai\AiGateway;
use App\Services\Ai\ModelRouter;
use App\Services\SettingsService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateChatTitleJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $chatId) {}

    public function handle(AiGateway $gateway, ModelRouter $router, SettingsService $settings): void
    {
        $chat = Chat::with('user')->find($this->chatId);

        if (! $chat || ! $settings->get('title_generation', true)) {
            return;
        }

        $first = $chat->messages()->where('role', 'user')->first();
        $answer = $chat->messages()->where('role', 'assistant')->first();

        if (! $first || ! $answer) {
            return;
        }

        $model = $router->chatModels()->firstWhere('tier', 'fast') ?? $router->chatModels()->first();

        if (! $model) {
            return;
        }

        try {
            $result = $gateway->chat($model, [
                ['role' => 'system', 'content' => 'Erzeuge einen sehr kurzen Titel (max. 6 Wörter) für diese Unterhaltung, in der Sprache des Benutzers. Antworte nur mit dem Titel, ohne Anführungszeichen.'],
                ['role' => 'user', 'content' => mb_substr((string) $first->content, 0, 800)."\n\n".mb_substr((string) $answer->content, 0, 800)],
            ], ['max_tokens' => 30, 'temperature' => 0.3], null, ['chat'], $chat->user, $chat, 'title');

            $title = trim(preg_replace('/\s+/', ' ', trim($result['content'], " \t\n\r\0\x0B\"'")));

            if ($title !== '') {
                $chat->update(['title' => mb_substr($title, 0, 120)]);
            }
        } catch (AiException) {
            // Der provisorische Titel bleibt bestehen.
        }
    }
}
