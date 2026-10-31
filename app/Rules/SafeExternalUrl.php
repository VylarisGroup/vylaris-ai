<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Erlaubt nur öffentliche, externe HTTPS-Adressen (Schutz vor SSRF und vor lokalen/selbst gehosteten Diensten).
 */
class SafeExternalUrl implements ValidationRule
{
    public static function isSafe(string $url): bool
    {
        $parts = parse_url($url);

        if (! $parts || empty($parts['host']) || ! in_array($parts['scheme'] ?? '', ['https'], true)) {
            return false;
        }

        $host = $parts['host'];

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return (bool) filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
        }

        if (in_array(strtolower($host), ['localhost'], true) || str_ends_with(strtolower($host), '.local') || str_ends_with(strtolower($host), '.internal')) {
            return false;
        }

        $records = @dns_get_record($host, DNS_A | DNS_AAAA) ?: [];

        foreach ($records as $record) {
            $ip = $record['ip'] ?? $record['ipv6'] ?? null;

            if ($ip && ! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return false;
            }
        }

        return true;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! self::isSafe($value)) {
            $fail('Die URL muss eine öffentliche HTTPS-Adresse sein (keine lokalen oder privaten Adressen).');
        }
    }
}
