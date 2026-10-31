<?php

namespace App\Services\Files;

use App\Models\UserFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Smalot\PdfParser\Parser as PdfParser;
use ZipArchive;

/**
 * Extrahiert Text und Tabellendaten aus hochgeladenen Dateien.
 */
class DocumentExtractor
{
    public const MAX_CHARS = 2_000_000;

    public const MAX_TABLE_ROWS = 5000;

    public function extract(UserFile $file): string
    {
        $path = \Storage::disk($file->disk)->path($file->path);
        $ext = strtolower(pathinfo($file->original_name, PATHINFO_EXTENSION));

        $text = match ($ext) {
            'pdf' => $this->pdf($path),
            'docx' => $this->docx($path),
            'xlsx' => $this->tableToText($this->table($path, 'xlsx')),
            'csv' => $this->tableToText($this->table($path, 'csv')),
            default => $this->plain($path),
        };

        return mb_substr($text, 0, self::MAX_CHARS);
    }

    private function plain(string $path): string
    {
        $raw = (string) file_get_contents($path);
        $encoding = mb_detect_encoding($raw, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true) ?: 'UTF-8';

        return $encoding === 'UTF-8' ? $raw : mb_convert_encoding($raw, 'UTF-8', $encoding);
    }

    private function pdf(string $path): string
    {
        $pdf = (new PdfParser)->parseFile($path);
        $pages = [];

        foreach ($pdf->getPages() as $index => $page) {
            $pages[] = '[Seite '.($index + 1)."]\n".trim($page->getText());
        }

        return implode("\n\n", $pages);
    }

    private function docx(string $path): string
    {
        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw new \RuntimeException('DOCX konnte nicht geöffnet werden.');
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) {
            throw new \RuntimeException('DOCX enthält keinen Textinhalt.');
        }

        $xml = preg_replace('/<w:tab\/>/', "\t", $xml);
        $xml = preg_replace('/<\/w:p>/', "\n", $xml);
        $xml = preg_replace('/<\/w:tc>/', " | ", $xml);

        return trim(html_entity_decode(strip_tags($xml), ENT_QUOTES | ENT_XML1, 'UTF-8'));
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    public function table(string $path, string $type): array
    {
        if ($type === 'csv') {
            $rows = [];
            $handle = fopen($path, 'r');
            $first = fgets($handle);
            rewind($handle);
            $delimiter = substr_count((string) $first, ';') > substr_count((string) $first, ',') ? ';' : ',';

            while (($row = fgetcsv($handle, 0, $delimiter)) !== false && count($rows) < self::MAX_TABLE_ROWS) {
                $rows[] = $row;
            }

            fclose($handle);

            return $rows;
        }

        $reader = IOFactory::createReader('Xlsx');
        $reader->setReadDataOnly(true);
        $sheet = $reader->load($path)->getActiveSheet();

        return array_slice($sheet->toArray(null, true, true, false), 0, self::MAX_TABLE_ROWS);
    }

    public function tableFor(UserFile $file): array
    {
        $ext = strtolower(pathinfo($file->original_name, PATHINFO_EXTENSION));

        if (! in_array($ext, ['csv', 'xlsx'], true)) {
            throw new \InvalidArgumentException('Nur CSV- und XLSX-Dateien können als Tabelle analysiert werden.');
        }

        return $this->table(\Storage::disk($file->disk)->path($file->path), $ext);
    }

    /**
     * @param  array<int, array<int, mixed>>  $rows
     */
    private function tableToText(array $rows): string
    {
        return implode("\n", array_map(fn ($row) => implode(' | ', array_map(fn ($v) => (string) $v, $row)), $rows));
    }
}
