<?php

namespace App\Services\Files;

class Chunker
{
    /**
     * Teilt Text an Absatzgrenzen in überlappende Abschnitte.
     *
     * @return array<int, string>
     */
    public function split(string $text, int $size = 1200, int $overlap = 150): array
    {
        $text = trim(preg_replace("/\r\n?/", "\n", $text));

        if ($text === '') {
            return [];
        }

        $paragraphs = preg_split("/\n{2,}|\n(?=\[Seite)/", $text) ?: [$text];
        $chunks = [];
        $current = '';

        foreach ($paragraphs as $paragraph) {
            while (mb_strlen($paragraph) > $size) {
                if ($current !== '') {
                    $chunks[] = $current;
                    $current = '';
                }

                $chunks[] = mb_substr($paragraph, 0, $size);
                $paragraph = mb_substr($paragraph, $size - $overlap);
            }

            if (mb_strlen($current) + mb_strlen($paragraph) + 2 > $size && $current !== '') {
                $chunks[] = $current;
                $current = mb_substr($current, -$overlap)."\n\n".$paragraph;
            } else {
                $current = $current === '' ? $paragraph : $current."\n\n".$paragraph;
            }
        }

        if (trim($current) !== '') {
            $chunks[] = $current;
        }

        return array_values(array_filter(array_map('trim', $chunks)));
    }
}
