<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));

        $users = User::with('role:id,name')
            ->withCount('chats')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role_id' => $u->role_id, 'role' => $u->role?->name,
                'is_active' => $u->is_active, 'verified' => $u->hasVerifiedEmail(), 'chats_count' => $u->chats_count,
                'limit_overrides' => $u->limit_overrides ?? (object) [], 'last_seen_at' => $u->last_seen_at?->toIso8601String(), 'created_at' => $u->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => Role::orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => ['q' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $user = User::create($data);
        $user->forceFill(['email_verified_at' => now()])->save();
        AuditService::log('user.created', $user, ['email' => $user->email]);

        return back()->with('success', 'Benutzer angelegt.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role_id' => ['required', 'exists:roles,id'],
            'is_active' => ['required', 'boolean'],
            'limit_overrides' => ['nullable', 'array'],
            'limit_overrides.messages_per_day' => ['nullable', 'integer', 'min:0'],
            'limit_overrides.tokens_per_month' => ['nullable', 'integer', 'min:0'],
            'limit_overrides.uploads_per_day' => ['nullable', 'integer', 'min:0'],
            'password' => ['nullable', Password::defaults()],
        ]);

        $this->guardLastAdmin($user, (int) $data['role_id'], (bool) $data['is_active']);

        $user->fill([
            'name' => $data['name'],
            'role_id' => $data['role_id'],
            'is_active' => $data['is_active'],
            'limit_overrides' => array_filter($data['limit_overrides'] ?? [], fn ($v) => $v !== null && $v !== '') ?: null,
        ]);

        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();
        AuditService::log('user.updated', $user, ['role_id' => $user->role_id, 'active' => $user->is_active]);

        return back()->with('success', 'Benutzer gespeichert.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'Das eigene Konto bitte unter Datenschutz löschen.');
        $this->guardLastAdmin($user, null, false);

        AuditService::log('user.deleted', $user, ['email_hash' => hash('sha256', $user->email)]);

        $user->files()->get()->each->delete();

        foreach (['uploads', 'generated', 'exports'] as $dir) {
            Storage::disk('private')->deleteDirectory($dir.'/'.$user->id);
        }

        $user->delete();

        return back()->with('success', 'Benutzer und alle zugehörigen Daten gelöscht.');
    }

    private function guardLastAdmin(User $user, ?int $newRoleId, bool $willBeActive): void
    {
        if (! $user->isAdmin()) {
            return;
        }

        $stillAdmin = $willBeActive && $newRoleId !== null && Role::find($newRoleId)?->hasPermission('admin.access');

        if ($stillAdmin) {
            return;
        }

        $otherAdmins = User::where('id', '!=', $user->id)->where('is_active', true)
            ->whereHas('role', fn ($q) => $q->where('permissions', 'like', '%"*"%')->orWhere('permissions', 'like', '%admin.access%'))
            ->count();

        abort_if($otherAdmins === 0, 422, 'Es muss mindestens ein aktiver Administrator bestehen bleiben.');
    }
}
