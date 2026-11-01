<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([RoleSeeder::class, FeatureSeeder::class, PlanSeeder::class]);

        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if ($email && $password) {
            $user = User::firstOrNew(['email' => $email]);
            $user->forceFill([
                'name' => env('ADMIN_NAME', 'Administrator'),
                'password' => $password,
                'role_id' => Role::where('slug', 'admin')->value('id'),
                'is_active' => true,
                'email_verified_at' => now(),
            ])->save();
        }
    }
}
