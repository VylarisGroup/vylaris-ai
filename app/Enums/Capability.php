<?php

namespace App\Enums;

/**
 * Technische Funktionstypen, die ein Modell bereitstellen kann.
 * Neue Typen werden hier ergänzt; Zuordnung zu Modellen erfolgt dynamisch in der Datenbank.
 */
enum Capability: string
{
    case Chat = 'chat';
    case Streaming = 'streaming';
    case Vision = 'vision';
    case Tools = 'tools';
    case Reasoning = 'reasoning';
    case Stt = 'stt';
    case Tts = 'tts';
    case ImageGeneration = 'image_generation';
    case Embeddings = 'embeddings';

    public function label(): string
    {
        return match ($this) {
            self::Chat => 'Chat / Textgenerierung',
            self::Streaming => 'Streaming-Ausgabe',
            self::Vision => 'Bildanalyse (Vision)',
            self::Tools => 'Funktionsaufrufe (Tools)',
            self::Reasoning => 'Reasoning',
            self::Stt => 'Speech-to-Text',
            self::Tts => 'Text-to-Speech',
            self::ImageGeneration => 'Bildgenerierung',
            self::Embeddings => 'Embeddings (RAG)',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $c) => ['value' => $c->value, 'label' => $c->label()], self::cases());
    }
}
