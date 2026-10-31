<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\UserFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Projects/Index', [
            'projects' => $request->user()->projects()->withCount(['chats', 'files'])->latest()->get()->map(fn (Project $p) => [
                'id' => $p->id, 'name' => $p->name, 'description' => $p->description, 'archived' => $p->archived_at !== null,
                'chats_count' => $p->chats_count, 'files_count' => $p->files_count,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->hasPermission('projects.use'), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'instructions' => ['nullable', 'string', 'max:10000'],
        ]);

        $project = $request->user()->projects()->create($data);

        return redirect()->route('projects.show', $project);
    }

    public function show(Request $request, Project $project): Response
    {
        Gate::authorize('view', $project);

        return Inertia::render('Projects/Show', [
            'project' => $project->only(['id', 'name', 'description', 'instructions']) + ['archived' => $project->archived_at !== null],
            'files' => $project->files()->latest()->get()->map(fn (UserFile $f) => [
                'id' => $f->id, 'name' => $f->original_name, 'mime' => $f->mime, 'size' => $f->size, 'kind' => $f->kind,
                'status' => $f->status, 'status_message' => $f->status_message, 'in_knowledge_base' => $f->in_knowledge_base,
            ]),
            'chats' => $project->chats()->orderByDesc('last_message_at')->get(['id', 'title', 'last_message_at']),
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        Gate::authorize('update', $project);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'instructions' => ['nullable', 'string', 'max:10000'],
            'archived' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('archived', $data)) {
            $data['archived_at'] = $data['archived'] ? now() : null;
            unset($data['archived']);
        }

        $project->update($data);

        return back()->with('success', 'Projekt gespeichert.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);

        $project->files()->get()->each->delete();
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Projekt gelöscht.');
    }
}
