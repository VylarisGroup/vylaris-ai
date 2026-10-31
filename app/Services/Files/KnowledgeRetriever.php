<?php

namespace App\Services\Files;

use App\Enums\Capability;
use App\Models\KnowledgeChunk;
use App\Models\User;
use App\Services\Ai\AiException;
use App\Services\Ai\AiGateway;
use App\Services\Features\FeatureManager;
use Illuminate\Support\Collection;

/**
 * Suche in Projekt-Wissensdatenbanken: Embeddings (falls konfiguriert), sonst gewichtete Stichwortsuche.
 */
class KnowledgeRetriever
{
    public function __construct(private FeatureManager $features, private AiGateway $gateway) {}

    /**
     * @param  array<int, int>|null  $fileIds  Auf diese Dateien beschränken
     * @return Collection<int, array{content: string, file: string, score: float}>
     */
    public function search(User $user, ?int $projectId, string $query, int $topK = 5, ?array $fileIds = null): Collection
    {
        $chunks = KnowledgeChunk::query()
            ->with('file:id,original_name')
            ->where('user_id', $user->id)
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when($fileIds !== null, fn ($q) => $q->whereIn('file_id', $fileIds))
            ->when($projectId === null && $fileIds === null, fn ($q) => $q->whereRaw('1 = 0'))
            ->get();

        if ($chunks->isEmpty() || trim($query) === '') {
            return collect();
        }

        $vector = $this->queryVector($user, $query);

        $scored = $chunks->map(function (KnowledgeChunk $chunk) use ($vector, $query) {
            $score = ($vector && $chunk->embedding)
                ? $this->cosine($vector, $chunk->embedding)
                : $this->lexical($query, $chunk->content);

            return ['content' => $chunk->content, 'file' => $chunk->file?->original_name ?? 'Datei', 'score' => $score];
        });

        return $scored->filter(fn ($c) => $c['score'] > 0)->sortByDesc('score')->take($topK)->values();
    }

    /**
     * @return array<int, float>|null
     */
    private function queryVector(User $user, string $query): ?array
    {
        $model = $this->features->model('rag');

        if (! $model || ! $model->hasCapability(Capability::Embeddings)) {
            return null;
        }

        try {
            return $this->gateway->embed($model, [mb_substr($query, 0, 2000)], $user)[0] ?? null;
        } catch (AiException) {
            return null;
        }
    }

    /**
     * @param  array<int, float>  $a
     * @param  array<int, float>  $b
     */
    private function cosine(array $a, array $b): float
    {
        $dot = $na = $nb = 0.0;

        foreach ($a as $i => $value) {
            $other = $b[$i] ?? 0.0;
            $dot += $value * $other;
            $na += $value * $value;
            $nb += $other * $other;
        }

        return ($na > 0 && $nb > 0) ? $dot / (sqrt($na) * sqrt($nb)) : 0.0;
    }

    private function lexical(string $query, string $content): float
    {
        $terms = $this->terms($query);

        if ($terms === []) {
            return 0.0;
        }

        $haystack = mb_strtolower($content);
        $score = 0.0;

        foreach ($terms as $term) {
            $count = substr_count($haystack, $term);
            $score += $count > 0 ? (1 + log($count)) * (mb_strlen($term) > 5 ? 1.3 : 1.0) : 0;
        }

        return $score / count($terms);
    }

    /**
     * @return array<int, string>
     */
    private function terms(string $text): array
    {
        $stop = ['der', 'die', 'das', 'und', 'oder', 'ist', 'sind', 'ein', 'eine', 'mit', 'von', 'für', 'the', 'and', 'for', 'with', 'what', 'was', 'wie', 'wer', 'wo', 'auf', 'zu', 'im', 'in', 'an', 'es'];

        $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_values(array_unique(array_filter($words, fn ($w) => mb_strlen($w) > 2 && ! in_array($w, $stop, true))));
    }
}
