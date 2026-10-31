<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DataExportReady extends Notification
{
    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Ihr Datenexport ist bereit')
            ->line('Der angeforderte Export Ihrer Daten wurde erstellt.')
            ->action('Export herunterladen', route('privacy.export.download'))
            ->line('Der Download ist nur nach Anmeldung möglich; alte Exporte werden nach 7 Tagen gelöscht.');
    }
}
