<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ErrorLog;
use App\Models\UsageLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    public function usage(Request $request): Response
    {
        $days = in_array((int) $request->query('days', 30), [7, 30, 90], true) ? (int) $request->query('days', 30) : 30;
        $since = now()->subDays($days);

        $perUser = UsageLog::query()->where('created_at', '>=', $since)->whereNotNull('user_id')
            ->selectRaw('user_id, COUNT(*) as requests, SUM(tokens_in) as tokens_in, SUM(tokens_out) as tokens_out, SUM(cost) as cost')
            ->groupBy('user_id')->orderByDesc('cost')->limit(50)->get()
            ->map(fn ($r) => ['user' => User::find($r->user_id)?->only(['name', 'email']) ?? ['name' => 'gelöscht', 'email' => ''], 'requests' => (int) $r->requests, 'tokens_in' => (int) $r->tokens_in, 'tokens_out' => (int) $r->tokens_out, 'cost' => round((float) $r->cost, 4)]);

        $perFeature = UsageLog::query()->where('created_at', '>=', $since)
            ->selectRaw('feature, COUNT(*) as requests, SUM(tokens_in + tokens_out) as tokens, SUM(cost) as cost')
            ->groupBy('feature')->get();

        return Inertia::render('Admin/Usage', [
            'days' => $days,
            'perUser' => $perUser,
            'perFeature' => $perFeature,
            'recent' => UsageLog::with('model:id,display_name')->latest()->limit(50)->get()->map(fn ($u) => [
                'id' => $u->id, 'feature' => $u->feature, 'model' => $u->model?->display_name, 'tokens_in' => $u->tokens_in, 'tokens_out' => $u->tokens_out,
                'cost' => $u->cost, 'latency_ms' => $u->latency_ms, 'status' => $u->status, 'created_at' => $u->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function errors(Request $request): Response
    {
        return Inertia::render('Admin/Errors', [
            'errors' => ErrorLog::with(['provider:id,name', 'model:id,display_name'])->latest()->paginate(30)->through(fn ($e) => [
                'id' => $e->id, 'provider' => $e->provider?->name, 'model' => $e->model?->display_name, 'feature' => $e->feature,
                'http_status' => $e->http_status, 'message' => $e->message, 'context' => $e->context, 'created_at' => $e->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function audit(Request $request): Response
    {
        return Inertia::render('Admin/Audit', [
            'logs' => AuditLog::with('user:id,name,email')->latest()->paginate(40)->through(fn ($l) => [
                'id' => $l->id, 'user' => $l->user?->name ?? 'System', 'action' => $l->action, 'subject' => $l->subject_type ? $l->subject_type.' #'.$l->subject_id : null,
                'meta' => $l->meta, 'ip' => $l->ip, 'created_at' => $l->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function prune(Request $request): RedirectResponse
    {
        $days = max(1, (int) $request->input('days', 90));
        $cutoff = now()->subDays($days);
        UsageLog::where('created_at', '<', $cutoff)->delete();
        ErrorLog::where('created_at', '<', $cutoff)->delete();

        return back()->with('success', "Logs älter als {$days} Tage gelöscht (Audit-Log bleibt erhalten).");
    }
}
