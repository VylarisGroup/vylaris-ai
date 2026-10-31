<?php

namespace App\Services\Tools;

/**
 * Registrierung aller Tools. Neue Tools: Klasse anlegen und hier eintragen (modulare Erweiterung).
 */
class ToolRegistry
{
    /**
     * @var array<int, class-string<Tool>>
     */
    public const TOOLS = [
        WebSearchTool::class,
        CreateDocumentTool::class,
        GenerateImageTool::class,
        RememberTool::class,
        ReadFileTool::class,
        AnalyzeTableTool::class,
    ];

    /** @var array<string, Tool>|null */
    private ?array $instances = null;

    /**
     * @return array<string, Tool>
     */
    public function all(): array
    {
        if ($this->instances === null) {
            $this->instances = [];

            foreach (self::TOOLS as $class) {
                $tool = app($class);
                $this->instances[$tool->name()] = $tool;
            }
        }

        return $this->instances;
    }

    public function get(string $name): ?Tool
    {
        return $this->all()[$name] ?? null;
    }

    /**
     * @param  array<int, string>|null  $allowed  null = alle verfügbaren
     * @return array<string, Tool>
     */
    public function available(ToolContext $context, ?array $allowed = null): array
    {
        return array_filter($this->all(), fn (Tool $t) => ($allowed === null || in_array($t->name(), $allowed, true)) && $t->available($context));
    }

    /**
     * @return array<int, array{key: string, label: string}>
     */
    public function catalog(): array
    {
        return array_values(array_map(fn (Tool $t) => ['key' => $t->name(), 'label' => $t->label()], $this->all()));
    }
}
