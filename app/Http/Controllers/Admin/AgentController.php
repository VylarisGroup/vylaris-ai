<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\AiModel;
use App\Services\AuditService;
use App\Services\Tools\ToolRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AgentController extends Controller
{
    public function index(ToolRegistry $tools): Response
    {
        return Inertia::render('Admin/Agents', [
            'agents' => Agent::orderBy('name')->get(),
            'tools' => $tools->catalog(),
            'models' => AiModel::with(['provider:id,name', 'capabilities'])->where('is_enabled', true)->get()
                ->filter(fn ($m) => $m->hasCapability('tools'))
                ->map(fn ($m) => ['id' => $m->id, 'name' => $m->display_name.' ('.$m->provider->name.')'])->values(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:500'],
            'instructions' => ['required', 'string', 'max:10000'],
            'tools' => ['nullable', 'array'],
            'tools.*' => ['string', Rule::in(array_column(app(ToolRegistry::class)->catalog(), 'key'))],
            'ai_model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'max_steps' => ['required', 'integer', 'between:1,20'],
            'is_enabled' => ['boolean'],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $agent = Agent::create($data + ['slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(4))]);
        AuditService::log('agent.created', $agent);

        return back()->with('success', 'Agent angelegt.');
    }

    public function update(Request $request, Agent $agent): RedirectResponse
    {
        $agent->update($request->validate($this->rules()));
        AuditService::log('agent.updated', $agent);

        return back()->with('success', 'Agent gespeichert.');
    }

    public function destroy(Agent $agent): RedirectResponse
    {
        AuditService::log('agent.deleted', $agent);
        $agent->delete();

        return back()->with('success', 'Agent gelöscht.');
    }
}
