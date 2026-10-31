<?php

namespace App\Services\Tools;

abstract class Tool
{
    /** Eindeutiger Schlüssel (auch Funktionsname gegenüber dem Modell). */
    abstract public function name(): string;

    abstract public function label(): string;

    abstract public function description(): string;

    /**
     * JSON-Schema der Parameter.
     *
     * @return array<string, mixed>
     */
    abstract public function parameters(): array;

    abstract public function available(ToolContext $context): bool;

    /**
     * @param  array<string, mixed>  $arguments
     */
    abstract public function run(array $arguments, ToolContext $context): ToolResult;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => $this->name(),
                'description' => $this->description(),
                'parameters' => $this->parameters(),
            ],
        ];
    }
}
