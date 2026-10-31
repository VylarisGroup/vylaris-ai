<?php

namespace App\Services\Update;

use RuntimeException;

/**
 * Fehler im Update-Ablauf; die Meldung ist für Administratoren bestimmt.
 */
class UpdateException extends RuntimeException {}
