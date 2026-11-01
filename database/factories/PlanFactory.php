<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ucfirst($name),
            'slug' => $name.'-'.fake()->unique()->numberBetween(1, 9999),
            'description' => fake()->sentence(),
            'price_cents' => 1900,
            'currency' => 'CHF',
            'interval' => 'month',
            'limits' => ['messages_per_day' => 1000, 'tokens_per_month' => -1, 'uploads_per_day' => 100],
            'highlights' => ['Mehr Nachrichten', 'Alle Modelle'],
            'is_active' => true,
        ];
    }

    public function free(): static
    {
        return $this->state(fn () => ['price_cents' => 0, 'is_default' => true, 'limits' => ['messages_per_day' => 5]]);
    }
}
