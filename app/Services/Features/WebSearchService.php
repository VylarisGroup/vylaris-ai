<?php

namespace App\Services\Features;

use App\Rules\SafeExternalUrl;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Websuche über einen konfigurierten externen Suchanbieter. Liefert Quellen mit Titel, URL und Auszug.
 */
class WebSearchService
{
    public function __construct(private FeatureManager $features) {}

    /**
     * @return array<int, array{title: string, url: string, snippet: string}>
     */
    public function search(string $query, ?int $limit = null): array
    {
        $config = $this->features->config('web_search');
        $limit ??= (int) ($config['max_results'] ?? 5);
        $limit = max(1, min(10, $limit));
        $driver = $config['driver'] ?? null;

        try {
            $results = match ($driver) {
                'tavily' => $this->tavily($config, $query, $limit),
                'brave' => $this->brave($config, $query, $limit),
                'serper' => $this->serper($config, $query, $limit),
                'searxng' => $this->searxng($config, $query, $limit),
                default => throw new \RuntimeException('Kein Suchanbieter konfiguriert.'),
            };
        } catch (ConnectionException $e) {
            throw new \RuntimeException('Suchanbieter nicht erreichbar.');
        }

        return array_slice(array_values(array_filter($results, fn ($r) => $r['url'] !== '')), 0, $limit);
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array{title: string, url: string, snippet: string}>
     */
    private function tavily(array $config, string $query, int $limit): array
    {
        $response = Http::timeout(20)->acceptJson()->post('https://api.tavily.com/search', [
            'api_key' => $config['api_key'] ?? '',
            'query' => $query,
            'max_results' => $limit,
            'include_answer' => false,
        ])->throw();

        return array_map(fn ($r) => $this->row($r['title'] ?? '', $r['url'] ?? '', $r['content'] ?? ''), $response->json('results') ?? []);
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array{title: string, url: string, snippet: string}>
     */
    private function brave(array $config, string $query, int $limit): array
    {
        $response = Http::timeout(20)->acceptJson()
            ->withHeaders(['X-Subscription-Token' => $config['api_key'] ?? ''])
            ->get('https://api.search.brave.com/res/v1/web/search', ['q' => $query, 'count' => $limit])->throw();

        return array_map(fn ($r) => $this->row($r['title'] ?? '', $r['url'] ?? '', $r['description'] ?? ''), $response->json('web.results') ?? []);
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array{title: string, url: string, snippet: string}>
     */
    private function serper(array $config, string $query, int $limit): array
    {
        $response = Http::timeout(20)->acceptJson()
            ->withHeaders(['X-API-KEY' => $config['api_key'] ?? ''])
            ->post('https://google.serper.dev/search', ['q' => $query, 'num' => $limit])->throw();

        return array_map(fn ($r) => $this->row($r['title'] ?? '', $r['link'] ?? '', $r['snippet'] ?? ''), $response->json('organic') ?? []);
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array<int, array{title: string, url: string, snippet: string}>
     */
    private function searxng(array $config, string $query, int $limit): array
    {
        $base = rtrim((string) ($config['base_url'] ?? ''), '/');

        if (! SafeExternalUrl::isSafe($base)) {
            throw new \RuntimeException('Ungültige SearXNG-Adresse.');
        }

        $response = Http::timeout(20)->acceptJson()->get($base.'/search', ['q' => $query, 'format' => 'json'])->throw();

        return array_map(fn ($r) => $this->row($r['title'] ?? '', $r['url'] ?? '', $r['content'] ?? ''), $response->json('results') ?? []);
    }

    /**
     * @return array{title: string, url: string, snippet: string}
     */
    private function row(string $title, string $url, string $snippet): array
    {
        $safeUrl = preg_match('#^https?://#i', $url) ? $url : '';

        return ['title' => mb_substr(trim($title), 0, 200), 'url' => $safeUrl, 'snippet' => mb_substr(trim(strip_tags($snippet)), 0, 800)];
    }
}
