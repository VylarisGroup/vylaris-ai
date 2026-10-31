<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserFile>
 */
class UserFileFactory extends Factory
{
    protected $model = UserFile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'disk' => 'private',
            'path' => 'uploads/test/'.fake()->uuid().'.txt',
            'original_name' => 'test.txt',
            'mime' => 'text/plain',
            'kind' => 'document',
            'size' => 10,
            'status' => 'ready',
            'extracted_text' => 'Inhalt',
        ];
    }
}
