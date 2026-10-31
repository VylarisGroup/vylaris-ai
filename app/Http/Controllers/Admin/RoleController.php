<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\AuditService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Roles', [
            'roles' => Role::withCount('users')->orderBy('name')->get(),
            'permissions' => collect(Permissions::all())->map(fn ($label, $key) => ['key' => $key, 'label' => $label])->values(),
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
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(array_merge(['*'], array_keys(Permissions::all())))],
            'limits' => ['nullable', 'array'],
            'limits.messages_per_day' => ['nullable', 'integer', 'min:0'],
            'limits.tokens_per_month' => ['nullable', 'integer', 'min:0'],
            'limits.uploads_per_day' => ['nullable', 'integer', 'min:0'],
            'is_default' => ['boolean'],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $role = Role::create($this->attributes($data) + ['slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(4))]);
        $this->defaultHandling($role);
        AuditService::log('role.created', $role);

        return back()->with('success', 'Rolle angelegt.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $data = $request->validate($this->rules());

        if ($role->slug === 'admin') {
            $data['permissions'] = ['*'];
        }

        $role->update($this->attributes($data));
        $this->defaultHandling($role);
        AuditService::log('role.updated', $role);

        return back()->with('success', 'Rolle gespeichert.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_if($role->is_system, 422, 'Systemrollen können nicht gelöscht werden.');
        abort_if($role->users()->exists(), 422, 'Der Rolle sind noch Benutzer zugeordnet.');

        AuditService::log('role.deleted', $role);
        $role->delete();

        return back()->with('success', 'Rolle gelöscht.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        return [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'permissions' => array_values($data['permissions'] ?? []),
            'limits' => array_filter($data['limits'] ?? [], fn ($v) => $v !== null && $v !== '') ?: null,
            'is_default' => $data['is_default'] ?? false,
        ];
    }

    private function defaultHandling(Role $role): void
    {
        if ($role->is_default) {
            Role::where('id', '!=', $role->id)->update(['is_default' => false]);
        }
    }
}
