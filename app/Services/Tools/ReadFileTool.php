<?php

namespace App\Services\Tools;

use App\Models\UserFile;
use App\Services\Features\FeatureManager;

class ReadFileTool extends Tool
{
    public function __construct(private FeatureManager $features) {}

    public function name(): string
    {
        return 'read_file';
    }

    public function label(): string
    {
        return 'Datei lesen';
    }

    public function description(): string
    {
        return 'Liest den extrahierten Text einer hochgeladenen Datei (nach file_id) abschnittsweise.';
    }

    public function parameters(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'file_id' => ['type' => 'integer'],
                'offset' => ['type' => 'integer', 'description' => 'Startzeichen, Standard 0'],
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

        if (! $file || $file->status !== 'ready' || $file->extracted_text === null) {
            return new ToolResult('Datei nicht gefunden oder noch nicht verarbeitet.');
        }

        $offset = max(0, (int) ($arguments['offset'] ?? 0));
        $text = $file->extracted_text;
        $part = mb_substr($text, $offset, 20000);
        $more = $offset + 20000 < mb_strlen($text) ? "\n\n[Fortsetzung mit offset=".($offset + 20000).']' : '';

        return new ToolResult($part.$more, [], [], 'Datei gelesen: '.$file->original_name);
    }
}
