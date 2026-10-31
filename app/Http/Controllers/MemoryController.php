<?php

namespace App\Http\Controllers;

use App\Models\Memory;
use App\Services\Features\FeatureManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MemoryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Memory', [
            'memories' => $request->user()->memories()->latest()->get(['id', 'content', 'source', 'created_at']),
        ]);
    }

    public function store(Request $request, FeatureManager $features): RedirectResponse
    {
        abort_unless($features->enabled('memory', $request->user()), 403, 'Memory ist nicht verfügbar.');
        $data = $request->validate(['content' => ['required', 'string', 'max:500']]);
        abort_if($request->user()->memories()->count() >= (int) ($features->config('memory')['max_items'] ?? 100), 422, 'Memory-Limit erreicht.');

        $request->user()->memories()->create($data + ['source' => 'manual']);

        return back();
    }

    public function update(Request $request, Memory $memory): RedirectResponse
    {
        Gate::authorize('update', $memory);
        $memory->update($request->validate(['content' => ['required', 'string', 'max:500']]));

        return back();
    }

    public function destroy(Memory $memory): RedirectResponse
    {
        Gate::authorize('delete', $memory);
        $memory->delete();

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $request->user()->memories()->delete();

        return back()->with('success', 'Memory vollständig gelöscht.');
    }
}
