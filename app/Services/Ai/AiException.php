<?php

namespace App\Services\Ai;

use RuntimeException;

class AiException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?int $status = null,
        public readonly bool $retryable = true,
        public readonly ?string $providerBody = null,
    ) {
        parent::__construct($message, $status ?? 0);
    }

    /**
     * Benutzerfreundliche Meldung ohne interne Details.
     */
    public function userMessage(): string
    {
        return match (true) {
            $this->status === 401 || $this->status === 403 => 'Der KI-Anbieter hat die Anmeldung abgelehnt. Bitte den Administrator informieren.',
            $this->status === 404 => 'Modell oder Endpunkt beim KI-Anbieter wurde nicht gefunden.',
            $this->status === 429 => 'Das Anfragelimit des KI-Anbieters ist erreicht. Bitte später erneut versuchen.',
            $this->status !== null && $this->status >= 500 => 'Der KI-Anbieter ist derzeit nicht erreichbar.',
            $this->status === null => 'Verbindung zum KI-Anbieter fehlgeschlagen.',
            default => 'Der KI-Anbieter hat die Anfrage abgelehnt.',
        };
    }
}
