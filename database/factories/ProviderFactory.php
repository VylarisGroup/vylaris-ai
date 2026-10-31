<?php

namespace Database\Factories;

use App\Models\Provider;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Provider>
 */
class ProviderFactory extends Factory
{
    protected $model = Provider::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'driver' => 'openai_compatible',
            'base_url' => 'https://api.example-ai.test/v1',
            'api_key' => 'sk-test-secret-key',
            'is_enabled' => true,
        ];
    }

    public function fallback(): static
    {
        return $this->state(['is_fallback' => true]);
    }
}
