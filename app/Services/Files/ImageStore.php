<?php

namespace App\Services\Files;

use App\Models\Chat;
use App\Models\User;
use App\Models\UserFile;
use App\Rules\SafeExternalUrl;
use App\Services\Ai\AiException;
use App\Services\Ai\AiGateway;
use App\Services\Features\FeatureManager;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageStore
{
    public function __construct(private FeatureManager $features, private AiGateway $gateway) {}

    /**
     * @return array<int, UserFile>
     */
    public function generate(User $user, string $prompt, ?string $size, ?Chat $chat = null): array
    {
        $model = $this->features->model('image_generation');

        if (! $model || $prompt === '') {
            throw new AiException('Bildgenerierung ist nicht konfiguriert.', null, false);
        }

        $allowed = $this->features->config('image_generation')['sizes'] ?? ['1024x1024'];
        $size = in_array($size, $allowed, true) ? $size : ($allowed[0] ?? '1024x1024');

        $items = $this->gateway->generateImage($model, mb_substr($prompt, 0, 4000), $size, $user, $chat);
        $files = [];

        foreach ($items as $item) {
            $binary = $item['b64'] ? base64_decode($item['b64'], true) : $this->download($item['url']);

            if (! $binary) {
                continue;
            }

            $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($binary);

            if (! in_array($mime, ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], true)) {
                continue;
            }

            $ext = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mime];
            $path = 'generated/'.$user->id.'/'.Str::uuid().'.'.$ext;
            Storage::disk('private')->put($path, $binary);

            $files[] = UserFile::create([
                'user_id' => $user->id,
                'chat_id' => $chat?->id,
                'disk' => 'private',
                'path' => $path,
                'original_name' => 'bild-'.now()->format('Ymd-His').'-'.(count($files) + 1).'.'.$ext,
                'mime' => $mime,
                'kind' => 'generated',
                'size' => strlen($binary),
                'sha256' => hash('sha256', $binary),
                'status' => 'ready',
            ]);
        }

        if ($files === []) {
            throw new AiException('Der Anbieter hat kein gültiges Bild geliefert.', null, false);
        }

        return $files;
    }

    private function download(?string $url): ?string
    {
        if (! $url || ! SafeExternalUrl::isSafe($url)) {
            return null;
        }

        $response = Http::timeout(30)->withOptions(['allow_redirects' => false])->get($url);

        return $response->successful() && strlen($response->body()) < 20 * 1024 * 1024 ? $response->body() : null;
    }
}
