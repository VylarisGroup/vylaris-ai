<?php

namespace App\Jobs;

use App\Enums\Capability;
use App\Models\KnowledgeChunk;
use App\Models\User;
use App\Models\UserFile;
use App\Services\Ai\AiException;
use App\Services\Ai\AiGateway;
use App\Services\Features\FeatureManager;
use App\Services\Files\Chunker;
use App\Services\Files\DocumentExtractor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Extrahiert Text, erzeugt Chunks und (optional) Embeddings für hochgeladene Dateien.
 */
class ProcessFileJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 300;

    public function __construct(public int $fileId) {}

    public function handle(DocumentExtractor $extractor, Chunker $chunker, FeatureManager $features, AiGateway $gateway): void
    {
        $file = UserFile::find($this->fileId);

        if (! $file) {
            return;
        }

        $file->update(['status' => 'processing']);

        try {
            if ($file->kind === 'image') {
                $file->update(['status' => 'ready', 'extracted_text' => null]);

                return;
            }

            $text = $extractor->extract($file);

            if (trim($text) === '') {
                $file->update(['status' => 'failed', 'status_message' => 'Kein extrahierbarer Text gefunden (z. B. gescanntes PDF ohne Textebene).']);

                return;
            }

            $file->update(['extracted_text' => $text, 'status' => 'ready', 'status_message' => null]);

            $config = $features->config('rag');
            $size = (int) ($config['chunk_size'] ?? 1200);
            $overlap = (int) ($config['chunk_overlap'] ?? 150);

            $needsChunks = $file->in_knowledge_base || mb_strlen($text) > 30000;

            if (! $needsChunks) {
                return;
            }

            $file->chunks()->delete();
            $pieces = $chunker->split($text, $size, $overlap);

            $embeddings = [];
            $model = $features->model('rag');

            if ($file->in_knowledge_base && $model && $model->hasCapability(Capability::Embeddings) && $features->enabled('rag', $file->user)) {
                try {
                    foreach (array_chunk($pieces, 64, true) as $batch) {
                        $vectors = $gateway->embed($model, array_values($batch), $file->user);

                        foreach (array_keys($batch) as $i => $key) {
                            $embeddings[$key] = $vectors[$i] ?? null;
                        }
                    }
                } catch (AiException) {
                    $embeddings = [];
                }
            }

            foreach ($pieces as $position => $piece) {
                KnowledgeChunk::create([
                    'user_id' => $file->user_id,
                    'project_id' => $file->project_id,
                    'file_id' => $file->id,
                    'position' => $position,
                    'content' => $piece,
                    'embedding' => $embeddings[$position] ?? null,
                ]);
            }
        } catch (\Throwable $e) {
            $file->update(['status' => 'failed', 'status_message' => mb_substr('Verarbeitung fehlgeschlagen: '.$e->getMessage(), 0, 500)]);
        }
    }
}
