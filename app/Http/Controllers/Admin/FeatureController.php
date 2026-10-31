<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\Feature;
use App\Models\Role;
use App\Rules\SafeExternalUrl;
use App\Services\AuditService;
use App\Services\Features\FeatureManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FeatureController extends Controller
{
    /** Erforderliche Modell-Capability je Funktion (null = Modell optional/nicht nötig). */
    private const MODEL_CAPABILITY = [
        'stt' => 'stt',
        'tts' => 'tts',
        'image_generation' => 'image_generation',
        'rag' => 'embeddings',
    ];

    public function index(FeatureManager $features): Response
    {
        return Inertia::render('Admin/Features', [
            'features' => Feature::with('roles:id,name')->orderBy('id')->get()->map(fn (Feature $f) => [
                'id' => $f->id,
                'key' => $f->key,
                'name' => $f->name,
                'description' => $f->description,
                'is_enabled' => $f->is_enabled,
                'ai_model_id' => $f->ai_model_id,
                'config' => $features->maskedConfig($f),
                'role_ids' => $f->roles->pluck('id'),
                'needs_model' => self::MODEL_CAPABILITY[$f->key] ?? null,
                'status' => $features->status($f->key, auth()->user()),
            ]),
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'models' => AiModel::with(['provider:id,name', 'capabilities'])->where('is_enabled', true)->get()->map(fn (AiModel $m) => [
                'id' => $m->id,
                'name' => $m->display_name.' ('.$m->provider->name.')',
                'capabilities' => $m->capabilities->pluck('capability')->values(),
            ]),
        ]);
    }

    public function update(Request $request, Feature $feature, FeatureManager $features): RedirectResponse
    {
        $data = $request->validate([
            'is_enabled' => ['required', 'boolean'],
            'ai_model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'config' => ['nullable', 'array'],
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $needed = self::MODEL_CAPABILITY[$feature->key] ?? null;

        if (! empty($data['ai_model_id']) && $needed) {
            $model = AiModel::with('capabilities')->find($data['ai_model_id']);
            abort_unless($model->hasCapability($needed), 422, "Das gewählte Modell besitzt die Capability '{$needed}' nicht.");
        }

        $config = $this->validatedConfig($feature->key, $data['config'] ?? []);

        $feature->update([
            'is_enabled' => $data['is_enabled'],
            'ai_model_id' => $data['ai_model_id'] ?? null,
            'config' => $features->prepareConfigForStorage($feature, $config),
        ]);

        $feature->roles()->sync($data['role_ids'] ?? []);
        $features->flush();

        AuditService::log('feature.updated', $feature, ['key' => $feature->key, 'enabled' => $feature->is_enabled]);

        return back()->with('success', 'Funktion gespeichert.');
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array<string, mixed>
     */
    private function validatedConfig(string $key, array $config): array
    {
        $rules = match ($key) {
            'web_search' => [
                'driver' => ['required', Rule::in(['tavily', 'brave', 'serper', 'searxng'])],
                'api_key' => ['nullable', 'string', 'max:500'],
                'base_url' => ['nullable', 'string', 'max:300', new SafeExternalUrl],
                'max_results' => ['nullable', 'integer', 'between:1,10'],
            ],
            'stt' => [
                'languages' => ['nullable', 'array'],
                'languages.*' => ['string', 'max:5'],
                'max_seconds' => ['nullable', 'integer', 'between:5,900'],
            ],
            'tts' => [
                'voices' => ['nullable', 'array', 'max:60'],
                'voices.*.id' => ['required', 'string', 'max:80'],
                'voices.*.label' => ['nullable', 'string', 'max:80'],
                'voices.*.language' => ['nullable', 'string', 'max:20'],
                'formats' => ['nullable', 'array'],
                'formats.*' => ['string', Rule::in(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'])],
                'default_format' => ['nullable', 'string', Rule::in(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'])],
                'min_speed' => ['nullable', 'numeric', 'between:0.25,4'],
                'max_speed' => ['nullable', 'numeric', 'between:0.25,4'],
                'max_chars' => ['nullable', 'integer', 'between:100,20000'],
            ],
            'image_generation' => [
                'sizes' => ['nullable', 'array', 'max:10'],
                'sizes.*' => ['string', 'regex:/^\d{3,4}x\d{3,4}$/'],
            ],
            'files' => [
                'max_size_mb' => ['nullable', 'integer', 'between:1,200'],
                'max_files_per_message' => ['nullable', 'integer', 'between:1,50'],
                'allowed_extensions' => ['nullable', 'array'],
                'allowed_extensions.*' => ['string', Rule::in(['pdf', 'docx', 'xlsx', 'csv', 'txt', 'md', 'png', 'jpg', 'jpeg', 'webp', 'gif'])],
            ],
            'memory' => [
                'max_items' => ['nullable', 'integer', 'between:1,1000'],
                'auto_extract' => ['nullable', 'boolean'],
            ],
            'rag' => [
                'chunk_size' => ['nullable', 'integer', 'between:300,4000'],
                'chunk_overlap' => ['nullable', 'integer', 'between:0,500'],
                'top_k' => ['nullable', 'integer', 'between:1,20'],
            ],
            'agents' => ['max_steps' => ['nullable', 'integer', 'between:1,20']],
            default => [],
        };

        return validator($config, $rules)->validate();
    }
}
