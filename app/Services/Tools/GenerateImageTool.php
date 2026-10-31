<?php

namespace App\Services\Tools;

use App\Services\Ai\AiException;
use App\Services\Features\FeatureManager;
use App\Services\Files\ImageStore;

class GenerateImageTool extends Tool
{
    public function __construct(private FeatureManager $features, private ImageStore $images) {}

    public function name(): string
    {
        return 'generate_image';
    }

    public function label(): string
    {
        return 'Bild generieren';
    }

    public function description(): string
    {
        return 'Erzeugt ein Bild anhand einer ausführlichen Beschreibung (Prompt, bevorzugt Englisch).';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'prompt' => ['type' => 'string'],
                'size' => ['type' => 'string', 'description' => 'z. B. 1024x1024'],
            ],
            'required' => ['prompt'],
        ];
    }

    public function available(ToolContext $context): bool
    {
        return $this->features->status('image_generation', $context->user)['configured'];
    }

    public function run(array $arguments, ToolContext $context): ToolResult
    {
        try {
            $files = $this->images->generate($context->user, (string) ($arguments['prompt'] ?? ''), $arguments['size'] ?? null, $context->chat);
        } catch (AiException $e) {
            return new ToolResult('Bildgenerierung fehlgeschlagen: '.$e->userMessage());
        } catch (\Throwable $e) {
            return new ToolResult('Bildgenerierung fehlgeschlagen: '.$e->getMessage());
        }

        return new ToolResult('Das Bild wurde erzeugt und dem Benutzer angezeigt.', [], array_map(fn ($f) => $f->id, $files), 'Bild erzeugt');
    }
}
