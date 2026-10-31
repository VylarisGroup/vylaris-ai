<?php

namespace App\Services\Tools;

use App\Models\UserFile;
use App\Services\Features\FeatureManager;
use App\Services\Files\DocumentExtractor;

class AnalyzeTableTool extends Tool
{
    public function __construct(private FeatureManager $features, private DocumentExtractor $extractor) {}

    public function name(): string
    {
        return 'analyze_table';
    }

    public function label(): string
    {
        return 'Datenanalyse';
    }

    public function description(): string
    {
        return 'Berechnet exakte Kennzahlen (Zeilen, Spalten, Min/Max/Mittel/Summe) und optional Gruppierungen für CSV/XLSX-Dateien.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'file_id' => ['type' => 'integer'],
                'group_by' => ['type' => 'string', 'description' => 'Spaltenname zum Gruppieren'],
                'value_column' => ['type' => 'string', 'description' => 'Numerische Spalte für die Aggregation'],
                'aggregate' => ['type' => 'string', 'enum' => ['sum', 'mean', 'count', 'min', 'max']],
            ],
            'required' => ['file_id'],
        ];
    }

    public function available(ToolContext $context): bool
    {
        return $this->features->enabled('files', $context->user);
    }

    public function run(array $arguments, ToolContext $context): ToolResult
    {
        $file = UserFile::where('user_id', $context->user->id)->find((int) ($arguments['file_id'] ?? 0));

        if (! $file) {
            return new ToolResult('Datei nicht gefunden.');
        }

        try {
            $rows = $this->extractor->tableFor($file);
        } catch (\Throwable $e) {
            return new ToolResult('Fehler: '.$e->getMessage());
        }

        if (count($rows) < 2) {
            return new ToolResult('Die Tabelle enthält keine Datenzeilen.');
        }

        $header = array_map(fn ($h) => trim((string) $h), array_shift($rows));
        $out = ['Zeilen: '.count($rows), 'Spalten: '.implode(', ', $header), ''];

        foreach ($header as $i => $name) {
            $values = array_values(array_filter(array_map(fn ($r) => $r[$i] ?? null, $rows), fn ($v) => $v !== null && $v !== ''));
            $numeric = array_values(array_filter($values, 'is_numeric'));

            if ($values !== [] && count($numeric) >= count($values) * 0.8) {
                $n = array_map('floatval', $numeric);
                $out[] = sprintf('%s: n=%d, min=%s, max=%s, mittel=%s, summe=%s', $name, count($n), min($n), max($n), round(array_sum($n) / count($n), 4), round(array_sum($n), 4));
            } else {
                $out[] = sprintf('%s: %d Werte, %d verschiedene', $name, count($values), count(array_unique($values)));
            }
        }

        $group = array_search($arguments['group_by'] ?? null, $header, true);
        $valueCol = array_search($arguments['value_column'] ?? null, $header, true);
        $aggregate = $arguments['aggregate'] ?? 'count';

        if ($group !== false) {
            $buckets = [];

            foreach ($rows as $row) {
                $key = (string) ($row[$group] ?? '');
                $buckets[$key][] = ($valueCol !== false && is_numeric($row[$valueCol] ?? null)) ? (float) $row[$valueCol] : null;
            }

            $out[] = '';
            $out[] = "Gruppierung nach {$header[$group]} ({$aggregate}):";

            foreach ($buckets as $key => $vals) {
                $nums = array_filter($vals, fn ($v) => $v !== null);
                $result = match ($aggregate) {
                    'sum' => array_sum($nums),
                    'mean' => $nums ? array_sum($nums) / count($nums) : 0,
                    'min' => $nums ? min($nums) : 0,
                    'max' => $nums ? max($nums) : 0,
                    default => count($vals),
                };
                $out[] = "- {$key}: ".round($result, 4);
            }
        }

        $out[] = '';
        $out[] = 'Erste Zeilen:';

        foreach (array_slice($rows, 0, 5) as $row) {
            $out[] = implode(' | ', array_map(fn ($v) => (string) $v, $row));
        }

        return new ToolResult(implode("\n", $out), [], [], 'Tabelle analysiert: '.$file->original_name);
    }
}
