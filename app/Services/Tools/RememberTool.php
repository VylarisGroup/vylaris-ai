<?php

namespace App\Services\Tools;

use App\Models\Memory;
use App\Services\Features\FeatureManager;

class RememberTool extends Tool
{
    public function __construct(private FeatureManager $features) {}

    public function name(): string
    {
        return 'remember';
    }

    public function label(): string
    {
        return 'Merken';
    }

    public function description(): string
    {
        return 'Speichert eine dauerhaft relevante Information über den Benutzer (nur auf ausdrücklichen Wunsch oder bei klar stabilen Präferenzen).';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => ['fact' => ['type' => 'string', 'description' => 'Kurze, eigenständige Aussage']],
            'required' => ['fact'],
        ];
    }

    public function available(ToolContext $context): bool
    {
        return $this->features->enabled('memory', $context->user);
    }

    public function run(array $arguments, ToolContext $context): ToolResult
    {
        $fact = trim(mb_substr((string) ($arguments['fact'] ?? ''), 0, 500));
        $max = (int) ($this->features->config('memory')['max_items'] ?? 100);

        if ($fact === '') {
            return new ToolResult('Fehler: Keine Information übergeben.');
        }

        if ($context->user->memories()->count() >= $max) {
            return new ToolResult('Speicher voll. Der Benutzer muss zuerst Einträge löschen.');
        }

        Memory::firstOrCreate(['user_id' => $context->user->id, 'content' => $fact], ['source' => 'auto', 'chat_id' => $context->chat?->id]);

        return new ToolResult('Gespeichert.', [], [], 'Gemerkt: '.$fact);
    }
}
