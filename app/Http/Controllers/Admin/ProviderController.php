<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Capability;
use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\Provider;
use App\Rules\SafeExternalUrl;
use App\Services\Ai\AiException;
use App\Services\Ai\ProviderClient;
use App\Services\AuditService;
use App\Services\Features\FeatureManager;
use App\Support\ProviderTemplates;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProviderController extends Controller
{
    public function index(): Response
    {
        $providers = Provider::with(['models.capabilities'])->orderBy('priority')->orderBy('name')->get()->map(fn (Provider $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'driver' => $p->driver,
            'template' => $p->template,
            'base_url' => $p->base_url,
            'has_key' => ! empty($p->api_key),
            'extra_header_names' => array_keys($p->extra_headers ?? []),
            'api_version' => $p->api_version,
            'timeout' => $p->timeout,
            'is_enabled' => $p->is_enabled,
            'is_fallback' => $p->is_fallback,
            'priority' => $p->priority,
            'notes' => $p->notes,
            'models' => $p->models->sortBy('sort')->values()->map(fn (AiModel $m) => [
                'id' => $m->id,
                'model_id' => $m->model_id,
                'display_name' => $m->display_name,
                'tier' => $m->tier,
                'parameters' => $m->parameters ?? (object) [],
                'allowed_parameters' => $m->allowed_parameters,
                'context_window' => $m->context_window,
                'price_input' => $m->price_input,
                'price_output' => $m->price_output,
                'currency' => $m->currency,
                'is_enabled' => $m->is_enabled,
                'is_default' => $m->is_default,
                'sort' => $m->sort,
                'capabilities' => $m->capabilities->map(fn ($c) => ['capability' => $c->capability, 'config' => $c->config ?? (object) []])->values(),
            ]),
        ]);

        return Inertia::render('Admin/Providers', [
            'providers' => $providers,
            'templates' => collect(ProviderTemplates::all())->map(fn ($t, $key) => ['key' => $key] + $t)->values(),
            'capabilities' => Capability::options(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?Provider $provider = null): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'driver' => ['required', Rule::in(['openai_compatible', 'azure_openai'])],
            'template' => ['nullable', 'string', 'max:40'],
            'base_url' => ['required', 'string', 'max:300', new SafeExternalUrl],
            'api_key' => ['nullable', 'string', 'max:500'],
            'extra_headers' => ['nullable', 'array', 'max:10'],
            'extra_headers.*' => ['nullable', 'string', 'max:500'],
            'api_version' => ['nullable', 'string', 'max:40'],
            'timeout' => ['nullable', 'integer', 'between:5,600'],
            'is_enabled' => ['boolean'],
            'is_fallback' => ['boolean'],
            'priority' => ['nullable', 'integer', 'between:1,10000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $provider = new Provider($this->fill($data));
        $provider->slug = $this->uniqueSlug($data['name']);
        $provider->save();

        AuditService::log('provider.created', $provider, ['name' => $provider->name]);

        return back()->with('success', 'Provider angelegt.');
    }

    public function update(Request $request, Provider $provider): RedirectResponse
    {
        $data = $request->validate($this->rules($provider));
        $provider->fill($this->fill($data, $provider))->save();

        AuditService::log('provider.updated', $provider, ['name' => $provider->name]);

        return back()->with('success', 'Provider gespeichert.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function fill(array $data, ?Provider $existing = null): array
    {
        $key = $data['api_key'] ?? null;
        unset($data['api_key']);

        // Leer lassen = bestehenden Schlüssel behalten; "__clear__" = löschen.
        if ($key === '__clear__') {
            $data['api_key'] = null;
        } elseif ($key !== null && $key !== '') {
            $data['api_key'] = $key;
        }

        if (array_key_exists('extra_headers', $data)) {
            $headers = array_filter($data['extra_headers'] ?? [], fn ($v) => $v !== null && $v !== '');
            $existingHeaders = $existing?->extra_headers ?? [];

            foreach ($headers as $name => $value) {
                if ($value === '********') {
                    $headers[$name] = $existingHeaders[$name] ?? '';
                }
            }

            $data['extra_headers'] = $headers ?: null;
        }

        $data['timeout'] = $data['timeout'] ?? 120;
        $data['priority'] = $data['priority'] ?? 100;
        $data['base_url'] = rtrim($data['base_url'], '/');

        return $data;
    }

    private function uniqueSlug(string $name): string
    {
        $slug = Str::slug($name) ?: 'provider';
        $candidate = $slug;
        $i = 2;

        while (Provider::where('slug', $candidate)->exists()) {
            $candidate = $slug.'-'.$i++;
        }

        return $candidate;
    }

    public function destroy(Provider $provider): RedirectResponse
    {
        AuditService::log('provider.deleted', $provider, ['name' => $provider->name]);
        $provider->delete();
        app(FeatureManager::class)->flush();

        return back()->with('success', 'Provider gelöscht.');
    }

    public function fromTemplate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'template' => ['required', Rule::in(array_keys(ProviderTemplates::all()))],
            'api_key' => ['nullable', 'string', 'max:500'],
            'base_url' => ['nullable', 'string', 'max:300', new SafeExternalUrl],
            'name' => ['nullable', 'string', 'max:80'],
            'with_models' => ['boolean'],
        ]);

        $template = ProviderTemplates::all()[$data['template']];
        $name = $data['name'] ?? $template['name'];

        $provider = Provider::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($name),
            'driver' => $template['driver'],
            'template' => $data['template'],
            'base_url' => rtrim($data['base_url'] ?? $template['base_url'], '/'),
            'api_key' => $data['api_key'] ?? null,
            'api_version' => $template['api_version'] ?? null,
            'is_enabled' => ! empty($data['api_key']),
        ]);

        if ($request->boolean('with_models', true)) {
            foreach ($template['models'] as $i => $m) {
                $model = $provider->models()->create([
                    'model_id' => $m['model_id'],
                    'display_name' => $m['display_name'],
                    'tier' => $m['tier'] ?? 'balanced',
                    'sort' => 100 + $i,
                    'is_enabled' => true,
                ]);

                foreach ($m['capabilities'] as $capability) {
                    $model->capabilities()->create(['capability' => $capability, 'config' => $m['config'][$capability] ?? null]);
                }
            }
        }

        AuditService::log('provider.created_from_template', $provider, ['template' => $data['template']]);

        return back()->with('success', 'Provider aus Vorlage angelegt. Bitte Capabilities und Modelle prüfen und die Verbindung testen.');
    }

    public function test(Request $request, Provider $provider): JsonResponse
    {
        $data = $request->validate(['model_id' => ['required', Rule::exists('ai_models', 'id')->where('provider_id', $provider->id)]]);
        $model = AiModel::with('capabilities')->find($data['model_id']);
        $client = new ProviderClient($provider);
        $started = microtime(true);

        try {
            if ($model->hasCapability(Capability::Chat)) {
                $client->ping($model);
            } elseif ($model->hasCapability(Capability::Embeddings)) {
                $client->embeddings($model, ['test']);
            } else {
                $client->listModels();
            }
        } catch (AiException $e) {
            return response()->json(['ok' => false, 'message' => $e->userMessage().' ('.mb_substr($e->getMessage(), 0, 200).')'], 200);
        }

        return response()->json(['ok' => true, 'message' => 'Verbindung erfolgreich', 'latency_ms' => (int) ((microtime(true) - $started) * 1000)]);
    }

    public function discover(Provider $provider): JsonResponse
    {
        try {
            $ids = (new ProviderClient($provider))->listModels();
        } catch (AiException $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()]);
        }

        return response()->json(['ok' => true, 'models' => $ids]);
    }
}
