<?php

namespace App\Support;

/**
 * Vorkonfigurierte Anbieter-Vorlagen. Sie füllen nur Formulare im Admin-Dashboard vor;
 * tatsächliche Provider und Modelle liegen in der Datenbank. Capabilities der Beispielmodelle
 * sind Vorschläge und müssen vom Administrator geprüft werden.
 */
class ProviderTemplates
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        $chat = ['chat', 'streaming', 'tools'];

        return [
            'openai' => [
                'name' => 'OpenAI',
                'driver' => 'openai_compatible',
                'base_url' => 'https://api.openai.com/v1',
                'docs' => 'https://platform.openai.com/docs/api-reference',
                'models' => [
                    ['model_id' => 'gpt-4o', 'display_name' => 'GPT-4o', 'tier' => 'strong', 'capabilities' => [...$chat, 'vision']],
                    ['model_id' => 'gpt-4o-mini', 'display_name' => 'GPT-4o mini', 'tier' => 'fast', 'capabilities' => [...$chat, 'vision']],
                    ['model_id' => 'whisper-1', 'display_name' => 'Whisper', 'tier' => 'fast', 'capabilities' => ['stt']],
                    ['model_id' => 'tts-1', 'display_name' => 'TTS-1', 'tier' => 'fast', 'capabilities' => ['tts'], 'config' => ['tts' => ['voices' => ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'], 'formats' => ['mp3', 'opus', 'aac', 'flac', 'wav']]]],
                    ['model_id' => 'dall-e-3', 'display_name' => 'DALL·E 3', 'tier' => 'strong', 'capabilities' => ['image_generation']],
                    ['model_id' => 'text-embedding-3-small', 'display_name' => 'Embedding small', 'tier' => 'fast', 'capabilities' => ['embeddings']],
                ],
            ],
            'openrouter' => [
                'name' => 'OpenRouter',
                'driver' => 'openai_compatible',
                'base_url' => 'https://openrouter.ai/api/v1',
                'docs' => 'https://openrouter.ai/docs',
                'models' => [
                    ['model_id' => 'openai/gpt-4o-mini', 'display_name' => 'GPT-4o mini (OpenRouter)', 'tier' => 'fast', 'capabilities' => [...$chat, 'vision']],
                    ['model_id' => 'anthropic/claude-sonnet-4.5', 'display_name' => 'Claude Sonnet (OpenRouter)', 'tier' => 'strong', 'capabilities' => [...$chat, 'vision']],
                ],
            ],
            'azure_openai' => [
                'name' => 'Azure OpenAI',
                'driver' => 'azure_openai',
                'base_url' => 'https://RESSOURCE.openai.azure.com',
                'api_version' => '2024-10-21',
                'docs' => 'https://learn.microsoft.com/azure/ai-services/openai/reference',
                'hint' => 'Als Modellname den Deployment-Namen eintragen.',
                'models' => [],
            ],
            'groq' => [
                'name' => 'Groq',
                'driver' => 'openai_compatible',
                'base_url' => 'https://api.groq.com/openai/v1',
                'docs' => 'https://console.groq.com/docs/openai',
                'models' => [
                    ['model_id' => 'llama-3.3-70b-versatile', 'display_name' => 'Llama 3.3 70B', 'tier' => 'balanced', 'capabilities' => $chat],
                    ['model_id' => 'whisper-large-v3', 'display_name' => 'Whisper large v3', 'tier' => 'fast', 'capabilities' => ['stt']],
                ],
            ],
            'mistral' => [
                'name' => 'Mistral AI',
                'driver' => 'openai_compatible',
                'base_url' => 'https://api.mistral.ai/v1',
                'docs' => 'https://docs.mistral.ai/api/',
                'models' => [
                    ['model_id' => 'mistral-large-latest', 'display_name' => 'Mistral Large', 'tier' => 'strong', 'capabilities' => $chat],
                    ['model_id' => 'mistral-embed', 'display_name' => 'Mistral Embed', 'tier' => 'fast', 'capabilities' => ['embeddings']],
                ],
            ],
            'deepseek' => [
                'name' => 'DeepSeek',
                'driver' => 'openai_compatible',
                'base_url' => 'https://api.deepseek.com/v1',
                'docs' => 'https://api-docs.deepseek.com/',
                'models' => [
                    ['model_id' => 'deepseek-chat', 'display_name' => 'DeepSeek Chat', 'tier' => 'balanced', 'capabilities' => $chat],
                    ['model_id' => 'deepseek-reasoner', 'display_name' => 'DeepSeek Reasoner', 'tier' => 'strong', 'capabilities' => ['chat', 'streaming', 'reasoning']],
                ],
            ],
            'together' => [
                'name' => 'Together AI',
                'driver' => 'openai_compatible',
                'base_url' => 'https://api.together.xyz/v1',
                'docs' => 'https://docs.together.ai/docs/openai-api-compatibility',
                'models' => [],
            ],
            'gemini' => [
                'name' => 'Google Gemini (OpenAI-kompatibel)',
                'driver' => 'openai_compatible',
                'base_url' => 'https://generativelanguage.googleapis.com/v1beta/openai',
                'docs' => 'https://ai.google.dev/gemini-api/docs/openai',
                'models' => [
                    ['model_id' => 'gemini-2.5-flash', 'display_name' => 'Gemini 2.5 Flash', 'tier' => 'fast', 'capabilities' => [...$chat, 'vision']],
                ],
            ],
            'xai' => [
                'name' => 'xAI',
                'driver' => 'openai_compatible',
                'base_url' => 'https://api.x.ai/v1',
                'docs' => 'https://docs.x.ai/',
                'models' => [],
            ],
            'custom' => [
                'name' => 'Eigener OpenAI-kompatibler Endpunkt',
                'driver' => 'openai_compatible',
                'base_url' => 'https://',
                'hint' => 'Beliebiger externer Dienst mit OpenAI-kompatibler API (kein lokales/selbst gehostetes Modell).',
                'models' => [],
            ],
        ];
    }
}
