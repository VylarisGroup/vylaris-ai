<?php

namespace Database\Factories;

use App\Models\AiModel;
use App\Models\Provider;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Schema;

/**
 * @extends Factory<AiModel>
 */
class AiModelFactory extends Factory
{
    protected $model = AiModel::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'provider_id' => Provider::factory(),
            'model_id' => 'model-'.fake()->unique()->lexify('????'),
            'display_name' => fake()->words(2, true),
            'tier' => 'balanced',
            'is_enabled' => true,
            'price_input' => 1,
            'price_output' => 2,
        ];
    }

    /**
     * @param  array<int, string>  $capabilities
     */
    public function withCapabilities(array $capabilities): static
    {
        return $this->afterCreating(function (AiModel $model) use ($capabilities) {
            foreach ($capabilities as $capability) {
                $model->capabilities()->create(['capability' => $capability]);
            }
        });
    }

    public function chat(): static
    {
        return $this->withCapabilities(['chat', 'streaming']);
    }
}
