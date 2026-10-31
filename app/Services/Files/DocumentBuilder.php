<?php

namespace App\Services\Files;

use App\Models\Chat;
use App\Models\User;
use App\Models\UserFile;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory as SheetIO;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpWord\IOFactory as WordIO;
use PhpOffice\PhpWord\PhpWord;

/**
 * Erzeugt Dokumente (DOCX, PDF, XLSX, CSV, Markdown, Text) aus Markdown-Inhalten.
 */
class DocumentBuilder
{
    public const FORMATS = ['docx', 'pdf', 'xlsx', 'csv', 'md', 'txt'];

    public function build(User $user, string $title, string $format, string $content, ?Chat $chat = null): UserFile
    {
        $format = strtolower($format);

        if (! in_array($format, self::FORMATS, true)) {
            throw new \InvalidArgumentException('Nicht unterstütztes Format: '.$format);
        }

        $binary = match ($format) {
            'docx' => $this->docx($title, $content),
            'pdf' => $this->pdf($title, $content),
            'xlsx' => $this->xlsx($content),
            'csv' => $this->csv($content),
            default => $content,
        };

        $slug = Str::slug($title) ?: 'dokument';
        $path = 'generated/'.$user->id.'/'.Str::uuid().'.'.$format;
        Storage::disk('private')->put($path, $binary);

        return UserFile::create([
            'user_id' => $user->id,
            'chat_id' => $chat?->id,
            'disk' => 'private',
            'path' => $path,
            'original_name' => $slug.'.'.$format,
            'mime' => self::mime($format),
            'kind' => 'generated',
            'size' => strlen($binary),
            'sha256' => hash('sha256', $binary),
            'status' => 'ready',
        ]);
    }

    public static function mime(string $format): string
    {
        return match ($format) {
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'pdf' => 'application/pdf',
            'csv' => 'text/csv',
            'md' => 'text/markdown',
            default => 'text/plain',
        };
    }

    private function docx(string $title, string $content): string
    {
        $word = new PhpWord;
        $word->setDefaultFontName('Calibri');
        $word->setDefaultFontSize(11);
        $section = $word->addSection();
        $section->addTitle($title, 0);

        $table = [];
        $flushTable = function () use (&$table, $section) {
            if ($table === []) {
                return;
            }

            $t = $section->addTable(['borderSize' => 6, 'borderColor' => '999999']);

            foreach ($table as $row) {
                $t->addRow();

                foreach ($row as $cell) {
                    $t->addCell(2500)->addText($cell);
                }
            }

            $table = [];
        };

        foreach (preg_split("/\r\n|\n|\r/", $content) as $line) {
            if (preg_match('/^\s*\|(.+)\|\s*$/', $line, $m)) {
                $cells = array_map('trim', explode('|', $m[1]));

                if (! preg_match('/^[\s:-]+$/', implode('', $cells))) {
                    $table[] = $cells;
                }

                continue;
            }

            $flushTable();

            if (preg_match('/^(#{1,3})\s+(.*)$/', $line, $m)) {
                $section->addTitle($this->stripInline($m[2]), strlen($m[1]));
            } elseif (preg_match('/^\s*[-*]\s+(.*)$/', $line, $m)) {
                $this->inline($section->addListItemRun(0), $m[1]);
            } elseif (preg_match('/^\s*\d+[.)]\s+(.*)$/', $line, $m)) {
                $this->inline($section->addListItemRun(0, 'number'), $m[1]);
            } elseif (trim($line) === '') {
                $section->addTextBreak();
            } else {
                $this->inline($section->addTextRun(), $line);
            }
        }

        $flushTable();

        return $this->saveWith(fn ($tmp) => WordIO::createWriter($word, 'Word2007')->save($tmp));
    }

    private function inline(object $run, string $text): void
    {
        foreach (preg_split('/(\*\*[^*]+\*\*)/', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) as $part) {
            if (str_starts_with($part, '**') && str_ends_with($part, '**')) {
                $run->addText(substr($part, 2, -2), ['bold' => true]);
            } else {
                $run->addText($this->stripInline($part));
            }
        }
    }

    private function stripInline(string $text): string
    {
        return preg_replace(['/\*\*(.+?)\*\*/', '/`(.+?)`/', '/\[(.+?)\]\((.+?)\)/'], ['$1', '$1', '$1 ($2)'], $text);
    }

    private function pdf(string $title, string $content): string
    {
        $html = Str::markdown($content, ['html_input' => 'strip', 'allow_unsafe_links' => false]);
        $document = '<html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;font-size:11px;line-height:1.5;color:#111}h1,h2,h3{margin:14px 0 6px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4px;text-align:left}code,pre{background:#f3f3f3;font-size:10px}</style></head><body><h1>'
            .e($title).'</h1>'.$html.'</body></html>';

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($document, 'UTF-8');
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
     * @return array<int, array<int, string>>
     */
    private function rows(string $content): array
    {
        $rows = [];

        foreach (preg_split("/\r\n|\n|\r/", $content) as $line) {
            if (trim($line) === '') {
                continue;
            }

            if (preg_match('/^\s*\|(.+)\|\s*$/', $line, $m)) {
                $cells = array_map('trim', explode('|', $m[1]));

                if (! preg_match('/^[\s:-]+$/', implode('', $cells))) {
                    $rows[] = $cells;
                }
            } elseif (str_contains($line, ';') || str_contains($line, "\t")) {
                $rows[] = array_map('trim', preg_split('/[;\t]/', $line));
            } else {
                $rows[] = [trim($line)];
            }
        }

        return $rows;
    }

    private function xlsx(string $content): string
    {
        $sheet = new Spreadsheet;
        $sheet->getActiveSheet()->fromArray($this->rows($content), null, 'A1');

        return $this->saveWith(fn ($tmp) => SheetIO::createWriter($sheet, 'Xlsx')->save($tmp));
    }

    private function csv(string $content): string
    {
        $handle = fopen('php://temp', 'r+');

        foreach ($this->rows($content) as $row) {
            fputcsv($handle, array_map(fn ($c) => preg_match('/^[=+\-@]/', $c) ? "'".$c : $c, $row));
        }

        rewind($handle);

        return stream_get_contents($handle);
    }

    private function saveWith(callable $writer): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'doc');
        $writer($tmp);
        $binary = (string) file_get_contents($tmp);
        @unlink($tmp);

        return $binary;
    }
}
