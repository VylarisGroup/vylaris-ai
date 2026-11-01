<?php

namespace App\Support;

/**
 * Katalog der Berechtigungen. Rollen speichern eine Liste dieser Schlüssel in der Datenbank ("*" = alles).
 */
class Permissions
{
    /**
     * @return array<string, string>
     */
    public static function all(): array
    {
        return [
            'chat.use' => 'Chat verwenden',
            'files.upload' => 'Dateien hochladen',
            'projects.use' => 'Projekte und Wissensdatenbanken nutzen',
            'admin.access' => 'Admin-Bereich betreten',
            'admin.providers' => 'Provider und Modelle verwalten',
            'admin.features' => 'Funktionen und Capabilities verwalten',
            'admin.users' => 'Benutzer und Rollen verwalten',
            'admin.settings' => 'Plattform-Einstellungen verwalten',
            'admin.logs' => 'Logs, Statistiken und Audit einsehen',
            'admin.plans' => 'Abo-Pläne und Abonnements verwalten',
            'admin.updates' => 'Updates und Cron-URL verwalten',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function userDefaults(): array
    {
        return ['chat.use', 'files.upload', 'projects.use'];
    }
}
