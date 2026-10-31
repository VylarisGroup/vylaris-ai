<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::updateOrCreate(['slug' => 'admin'], [
            'name' => 'Administrator',
            'description' => 'Voller Zugriff auf Plattform und Admin-Dashboard.',
            'permissions' => ['*'],
            'is_system' => true,
        ]);

        Role::updateOrCreate(['slug' => 'user'], [
            'name' => 'Benutzer',
            'description' => 'Standardrolle für registrierte Benutzer.',
            'permissions' => Permissions::userDefaults(),
            'limits' => ['messages_per_day' => 200, 'tokens_per_month' => 1000000, 'uploads_per_day' => 30],
            'is_system' => true,
            'is_default' => true,
        ]);
    }
}
