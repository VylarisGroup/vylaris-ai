<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FolderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80']]);
        abort_if($request->user()->folders()->count() >= 100, 422, 'Maximale Anzahl Ordner erreicht.');
        $folder = $request->user()->folders()->create($data);

        return response()->json($folder->only(['id', 'name']), 201);
    }

    public function update(Request $request, Folder $folder): JsonResponse
    {
        Gate::authorize('update', $folder);
        $folder->update($request->validate(['name' => ['required', 'string', 'max:80']]));

        return response()->json($folder->only(['id', 'name']));
    }

    public function destroy(Folder $folder): JsonResponse
    {
        Gate::authorize('delete', $folder);
        $folder->delete();

        return response()->json(['ok' => true]);
    }
}
