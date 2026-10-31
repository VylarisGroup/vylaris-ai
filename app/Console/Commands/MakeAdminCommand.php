<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\FeatureSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Console\Command;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class MakeAdminCommand extends Command
{
    protected $signature = 'vylaris:make-admin {email? : E-Mail-Adresse} {--name= : Anzeigename} {--password= : Passwort (nicht-interaktiv)}';

    protected $description = 'Erstellt oder befördert einen Administrator (legt Standardrollen und Funktionen bei Bedarf an).';

    public function handle(): int
    {
        (new RoleSeeder)->run();
        (new FeatureSeeder)->run();

        $email = $this->argument('email') ?? text('E-Mail-Adresse', required: true);
        $user = User::firstOrNew(['email' => strtolower($email)]);

        if (! $user->exists) {
            $user->name = $this->option('name') ?? text('Name', default: 'Administrator');
            $user->password = $this->option('password') ?? password('Passwort (mind. 8 Zeichen)', required: true);
        }

        $user->role_id = Role::where('slug', 'admin')->value('id');
        $user->is_active = true;
        $user->email_verified_at ??= now();
        $user->save();

        $this->info("Administrator bereit: {$user->email}");

        return self::SUCCESS;
    }
}
