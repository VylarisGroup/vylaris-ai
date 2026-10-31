<?php

namespace App\Services\Tools;

use App\Services\Features\FeatureManager;
use App\Services\Features\WebSearchService;

class WebSearchTool extends Tool
{
    public function __construct(private FeatureManager $features, private WebSearchService $search) {}

    public function name(): string
    {
        return 'web_search';
    }

    public function label(): string
    {
        return 'Websuche';
    }

    public function description(): string
    {
        return 'Durchsucht das Web nach aktuellen Informationen und liefert nummerierte Quellen. Quellen im Text als [1], [2] zitieren.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => ['query' => ['type' => 'string', 'description' => 'Suchanfrage']],
            'required' => ['query'],
        ];
    }

    public function available(ToolContext $context): bool
    {
        return $this->features->status('web_search', $context->user)['configured'];
    }

    public function run(array $arguments, ToolContext $context): ToolResult
    {
        $query = trim((string) ($arguments['query'] ?? ''));

        if ($query === '') {
            return new ToolResult('Fehler: Suchanfrage fehlt.');
        }

        $results = $this->search->search($query);
        $lines = [];

        foreach ($results as $i => $r) {
            $lines[] = '['.($i + 1)."] {$r['title']} ({$r['url']})\n{$r['snippet']}";
        }

        return new ToolResult($lines ? implode("\n\n", $lines) : 'Keine Ergebnisse gefunden.', $results, [], "Suche: {$query}");
    }
}
