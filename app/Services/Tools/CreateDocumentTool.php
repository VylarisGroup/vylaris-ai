<?php

namespace App\Services\Tools;

use App\Services\Features\FeatureManager;
use App\Services\Files\DocumentBuilder;

class CreateDocumentTool extends Tool
{
    public function __construct(private FeatureManager $features, private DocumentBuilder $builder) {}

    public function name(): string
    {
        return 'create_document';
    }

    public function label(): string
    {
        return 'Dokument erstellen';
    }

    public function description(): string
    {
        return 'Erstellt eine herunterladbare Datei (docx, pdf, xlsx, csv, md, txt) aus Markdown. Für xlsx/csv Markdown-Tabellen verwenden.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'title' => ['type' => 'string'],
                'format' => ['type' => 'string', 'enum' => DocumentBuilder::FORMATS],
                'content' => ['type' => 'string', 'description' => 'Inhalt in Markdown'],
            ],
            'required' => ['title', 'format', 'content'],
        ];
    }

    public function available(ToolContext $context): bool
    {
        return $this->features->enabled('documents', $context->user);
    }

    public function run(array $arguments, ToolContext $context): ToolResult
    {
        try {
            $file = $this->builder->build($context->user, (string) ($arguments['title'] ?? 'Dokument'), (string) ($arguments['format'] ?? 'md'), (string) ($arguments['content'] ?? ''), $context->chat);
        } catch (\Throwable $e) {
            return new ToolResult('Fehler beim Erstellen des Dokuments: '.$e->getMessage());
        }

        return new ToolResult("Dokument '{$file->original_name}' wurde erstellt und steht zum Download bereit.", [], [$file->id], "Dokument: {$file->original_name}");
    }
}
