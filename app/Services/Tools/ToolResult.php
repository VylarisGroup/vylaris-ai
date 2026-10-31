<?php

namespace App\Services\Tools;

class ToolResult
{
    /**
     * @param  array<int, array{title: string, url: string, snippet: string}>  $sources
     * @param  array<int, int>  $generatedFileIds
     */
    public function __construct(
        public readonly string $content,
        public readonly array $sources = [],
        public readonly array $generatedFileIds = [],
        public readonly string $summary = '',
    ) {}
}
