<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            ['key' => 'streaming', 'name' => 'Streaming-Ausgabe', 'description' => 'Antworten token-weise anzeigen, sofern das Modell Streaming unterstützt.', 'is_enabled' => true, 'config' => []],
            ['key' => 'files', 'name' => 'Datei-Uploads und Dokumentenverarbeitung', 'description' => 'PDF, DOCX, XLSX, CSV, TXT und Bilder hochladen und analysieren.', 'is_enabled' => true, 'config' => ['max_size_mb' => 20, 'max_files_per_message' => 10, 'allowed_extensions' => ['pdf', 'docx', 'xlsx', 'csv', 'txt', 'md', 'png', 'jpg', 'jpeg', 'webp', 'gif']]],
            ['key' => 'web_search', 'name' => 'Websuche mit Quellenangaben', 'description' => 'Externer Suchanbieter (Tavily, Brave, Serper oder SearXNG-Instanz).', 'is_enabled' => false, 'config' => ['driver' => 'tavily', 'max_results' => 5]],
            ['key' => 'stt', 'name' => 'Speech-to-Text (Spracheingabe)', 'description' => 'Transkription über ein Modell mit STT-Capability.', 'is_enabled' => false, 'config' => ['languages' => ['de', 'en', 'fr', 'it'], 'max_seconds' => 120]],
            ['key' => 'tts', 'name' => 'Text-to-Speech (Vorlesen)', 'description' => 'Sprachausgabe über ein Modell mit TTS-Capability.', 'is_enabled' => false, 'config' => ['voices' => [], 'formats' => ['mp3', 'opus', 'aac', 'flac', 'wav'], 'default_format' => 'mp3', 'min_speed' => 0.5, 'max_speed' => 2.0, 'max_chars' => 4000]],
            ['key' => 'image_generation', 'name' => 'Bildgenerierung', 'description' => 'Bilder über ein Modell mit Bildgenerierungs-Capability erzeugen.', 'is_enabled' => false, 'config' => ['sizes' => ['1024x1024', '1792x1024', '1024x1792']]],
            ['key' => 'memory', 'name' => 'Langfristiges Memory', 'description' => 'Wichtige Informationen über den Benutzer dauerhaft und transparent speichern.', 'is_enabled' => true, 'config' => ['max_items' => 100, 'auto_extract' => true]],
            ['key' => 'rag', 'name' => 'Projekt-Wissensdatenbanken (RAG)', 'description' => 'Dokumente pro Projekt durchsuchbar machen. Embedding-Modell optional, sonst Stichwortsuche.', 'is_enabled' => true, 'config' => ['chunk_size' => 1200, 'chunk_overlap' => 150, 'top_k' => 5]],
            ['key' => 'agents', 'name' => 'KI-Agenten (mehrstufige Aufgaben)', 'description' => 'Agenten mit Tools für mehrstufige Aufgaben; benötigt Modelle mit Tools-Capability.', 'is_enabled' => true, 'config' => ['max_steps' => 8]],
            ['key' => 'documents', 'name' => 'Dokumentenerstellung', 'description' => 'KI-Ausgaben als DOCX, PDF, XLSX oder Markdown exportieren und per Tool erzeugen.', 'is_enabled' => true, 'config' => []],
        ];

        foreach ($features as $feature) {
            Feature::firstOrCreate(['key' => $feature['key']], $feature);
        }
    }
}
