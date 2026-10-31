<?php

namespace App\Jobs;

use App\Models\Chat;
use App\Models\Memory;
use App\Services\Ai\AiException;
use App\Services\Ai\AiGateway;
use App\Services\Ai\ModelRouter;
use App\Services\Features\FeatureManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Extrahiert dauerhaft relevante Fakten aus der letzten Benutzernachricht. Das Ergebnis ist für den Benutzer einsehbar und löschbar.
 */
class ExtractMemoriesJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $chatId, public int $userMessageId) {}

    public function handle(AiGateway $gateway, ModelRouter $router, FeatureManager $features): void
    {
        $chat = Chat::with('user')->find($this->chatId);
        $message = $chat?->messages()->find($this->userMessageId);

        if (! $chat || ! $message || mb_strlen((string) $message->content) < 20 || ! $features->enabled('memory', $chat->user)) {
            return;
        }

        $max = (int) ($features->config('memory')['max_items'] ?? 100);

        if ($chat->user->memories()->count() >= $max) {
            return;
        }

        $model = $router->chatModels()->firstWhere('tier', 'fast') ?? $router->chatModels()->first();

        if (! $model) {
            return;
        }

        $existing = $chat->user->memories()->latest()->limit(30)->pluck('content')->implode("\n- ");

        try {
            $result = $gateway->chat($model, [
                ['role' => 'system', 'content' => 'Du extrahierst dauerhaft nützliche Fakten über den Benutzer (Beruf, Vorlieben, Projekte, Sprache, wiederkehrende Ziele) aus seiner Nachricht. Ignoriere flüchtige Details, Geheimnisse, Passwörter, Gesundheits- und andere sensible Daten, ausser der Benutzer verlangt ausdrücklich das Merken. Antworte ausschliesslich mit einem JSON-Array kurzer deutscher Aussagen, z. B. ["Arbeitet als Softwareentwickler"]. Wenn nichts Relevantes vorliegt: []. Bereits bekannt:'."\n- ".$existing],
                ['role' => 'user', 'content' => mb_substr((string) $message->content, 0, 2000)],
            ], ['max_tokens' => 300, 'temperature' => 0], null, ['chat'], $chat->user, $chat, 'memory');

            preg_match('/\[.*\]/s', $result['content'], $match);
            $facts = json_decode($match[0] ?? '[]', true);

            foreach (array_slice(is_array($facts) ? $facts : [], 0, 3) as $fact) {
                if (is_string($fact) && mb_strlen(trim($fact)) > 5) {
                    Memory::firstOrCreate(['user_id' => $chat->user_id, 'content' => mb_substr(trim($fact), 0, 500)], ['source' => 'auto', 'chat_id' => $chat->id]);
                }
            }
        } catch (AiException) {
            // Memory ist optional.
        }
    }
}
