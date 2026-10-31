<?php

namespace Tests\Concerns;

use App\Models\AiModel;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\FeatureSeeder;
use Database\Seeders\RoleSeeder;

trait CreatesPlatform
{
    protected function seedPlatform(): void
    {
        $this->seed([RoleSeeder::class, FeatureSeeder::class]);
    }

    protected function makeUser(string $role = 'user', array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role_id' => Role::where('slug', $role)->value('id'),
            'email_verified_at' => now(),
        ], $attributes));
    }

    protected function makeChatModel(array $capabilities = ['chat', 'streaming'], array $attributes = []): AiModel
    {
        return AiModel::factory()->withCapabilities($capabilities)->create($attributes);
    }

    /**
     * Baut einen SSE-Body im OpenAI-Format.
     *
     * @param  array<int, string>  $chunks
     */
    protected function sseBody(array $chunks, int $in = 12, int $out = 5): string
    {
        $lines = [];

        foreach ($chunks as $chunk) {
            $lines[] = 'data: '.json_encode(['choices' => [['delta' => ['content' => $chunk], 'finish_reason' => null]]]);
        }

        $lines[] = 'data: '.json_encode(['choices' => [['delta' => [], 'finish_reason' => 'stop']]]);
        $lines[] = 'data: '.json_encode(['choices' => [], 'usage' => ['prompt_tokens' => $in, 'completion_tokens' => $out]]);
        $lines[] = 'data: [DONE]';

        return implode("\n\n", $lines)."\n\n";
    }
}
