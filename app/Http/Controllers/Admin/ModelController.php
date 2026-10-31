<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Capability;
use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\Provider;
use App\Services\AuditService;
use App\Services\Features\FeatureManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModelController extends Controller
{
    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'model_id' => ['required', 'string', 'max:200'],
            'display_name' => ['required', 'string', 'max:120'],
            'tier' => ['required', Rule::in(['fast', 'balanced', 'strong'])],
            'parameters' => ['nullable', 'array'],
            'parameters.temperature' => ['nullable', 'numeric', 'between:0,2'],
            'parameters.top_p' => ['nullable', 'numeric', 'between:0,1'],
            'parameters.max_tokens' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'parameters.presence_penalty' => ['nullable', 'numeric', 'between:-2,2'],
            'parameters.frequency_penalty' => ['nullable', 'numeric', 'between:-2,2'],
            'parameters.reasoning_effort' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'parameters._stream_usage' => ['nullable', 'boolean'],
            'allowed_parameters' => ['nullable', 'array'],
            'allowed_parameters.*' => ['string', Rule::in(array_keys(\App\Services\Ai\AiGateway::PARAMETER_RANGES))],
            'context_window' => ['nullable', 'integer', 'min:0'],
            'price_input' => ['nullable', 'numeric', 'min:0'],
            'price_output' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'is_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'sort' => ['nullable', 'integer'],
            'capabilities' => ['array'],
            'capabilities.*.capability' => ['required', Rule::in(array_column(Capability::cases(), 'value'))],
            'capabilities.*.config' => ['nullable', 'array'],
        ];
    }

    public function store(Request $request, Provider $provider): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $model = $provider->models()->create($this->attributes($data));
        $this->syncCapabilities($model, $data['capabilities'] ?? []);
        $this->afterSave($model);

        AuditService::log('model.created', $model, ['model' => $model->model_id]);

        return back()->with('success', 'Modell angelegt.');
    }

    public function update(Request $request, AiModel $model): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $model->update($this->attributes($data));
        $this->syncCapabilities($model, $data['capabilities'] ?? []);
        $this->afterSave($model);

        AuditService::log('model.updated', $model, ['model' => $model->model_id]);

        return back()->with('success', 'Modell gespeichert.');
    }

    public function destroy(AiModel $model): RedirectResponse
    {
        AuditService::log('model.deleted', $model, ['model' => $model->model_id]);
        $model->delete();
        app(FeatureManager::class)->flush();

        return back()->with('success', 'Modell gelöscht.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        $params = array_filter($data['parameters'] ?? [], fn ($v) => $v !== null && $v !== '');

        return [
            'model_id' => $data['model_id'],
            'display_name' => $data['display_name'],
            'tier' => $data['tier'],
            'parameters' => $params ?: null,
            'allowed_parameters' => $data['allowed_parameters'] ?? null,
            'context_window' => $data['context_window'] ?? null,
            'price_input' => $data['price_input'] ?? 0,
            'price_output' => $data['price_output'] ?? 0,
            'currency' => strtoupper($data['currency'] ?? 'USD'),
            'is_enabled' => $data['is_enabled'] ?? true,
            'is_default' => $data['is_default'] ?? false,
            'sort' => $data['sort'] ?? 100,
        ];
    }

    /**
     * @param  array<int, array{capability: string, config?: array<string, mixed>|null}>  $capabilities
     */
    private function syncCapabilities(AiModel $model, array $capabilities): void
    {
        $keep = [];

        foreach ($capabilities as $item) {
            $model->capabilities()->updateOrCreate(['capability' => $item['capability']], ['config' => $item['config'] ?? null]);
            $keep[] = $item['capability'];
        }

        $model->capabilities()->whereNotIn('capability', $keep)->delete();
    }

    private function afterSave(AiModel $model): void
    {
        if ($model->is_default) {
            AiModel::where('id', '!=', $model->id)->update(['is_default' => false]);
        }

        app(FeatureManager::class)->flush();
    }
}
