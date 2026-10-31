<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessFileJob;
use App\Models\UserFile;
use App\Services\Features\FeatureManager;
use App\Services\Features\UsageLimiter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    /** Erlaubte Erweiterungen und die dazu passenden, per Inhalt geprüften MIME-Typen. */
    private const MIME_MAP = [
        'pdf' => ['application/pdf'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'],
        'csv' => ['text/csv', 'text/plain', 'application/csv', 'application/octet-stream'],
        'txt' => ['text/plain'],
        'md' => ['text/plain', 'text/markdown'],
        'png' => ['image/png'],
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'webp' => ['image/webp'],
        'gif' => ['image/gif'],
    ];

    public function __construct(private FeatureManager $features, private UsageLimiter $limiter) {}

    public function index(Request $request): Response
    {
        $files = $request->user()->files()
            ->where('kind', '!=', 'generated')
            ->latest()->get()
            ->map(fn (UserFile $f) => $this->info($f));

        $generated = $request->user()->files()->where('kind', 'generated')->latest()->limit(100)->get()->map(fn (UserFile $f) => $this->info($f));

        return Inertia::render('Settings/Files', ['files' => $files, 'generated' => $generated]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->hasPermission('files.upload') && $this->features->enabled('files', $user), 403, 'Datei-Uploads sind nicht verfügbar.');

        $config = $this->features->config('files');
        $maxKb = (int) ($config['max_size_mb'] ?? 20) * 1024;
        $allowed = $config['allowed_extensions'] ?? array_keys(self::MIME_MAP);

        $request->validate([
            'files' => ['required', 'array', 'max:'.(int) ($config['max_files_per_message'] ?? 10)],
            'files.*' => ['file', 'max:'.$maxKb],
            'project_id' => ['nullable', Rule::exists('projects', 'id')->where('user_id', $user->id)],
            'knowledge' => ['nullable', 'boolean'],
        ]);

        try {
            $this->limiter->assertCanUpload($user, count($request->file('files')));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 429);
        }

        $created = [];
        $errors = [];

        foreach ($request->file('files') as $upload) {
            $result = $this->validateContent($upload, $allowed);

            if (is_string($result)) {
                $errors[] = $upload->getClientOriginalName().': '.$result;

                continue;
            }

            $ext = $result['ext'];
            $path = 'uploads/'.$user->id.'/'.Str::uuid().'.'.$ext;
            Storage::disk('private')->putFileAs(dirname($path), $upload, basename($path));

            $name = preg_replace('/[^\p{L}\p{N}\s._\-()]/u', '_', basename($upload->getClientOriginalName()));

            $file = UserFile::create([
                'user_id' => $user->id,
                'project_id' => $request->input('project_id'),
                'disk' => 'private',
                'path' => $path,
                'original_name' => mb_substr($name, 0, 200),
                'mime' => $result['mime'],
                'kind' => str_starts_with($result['mime'], 'image/') ? 'image' : 'document',
                'size' => $upload->getSize(),
                'sha256' => hash_file('sha256', $upload->getRealPath()),
                'status' => 'pending',
                'in_knowledge_base' => $request->boolean('knowledge') && $request->filled('project_id'),
            ]);

            ProcessFileJob::dispatch($file->id);
            $created[] = $this->info($file);
        }

        return response()->json(['files' => $created, 'errors' => $errors], $created ? 201 : 422);
    }

    /**
     * Prüft Erweiterung und tatsächlichen Dateiinhalt (nicht dem Client-MIME vertrauen).
     *
     * @param  array<int, string>  $allowed
     * @return array{ext: string, mime: string}|string
     */
    private function validateContent(UploadedFile $upload, array $allowed): array|string
    {
        $ext = strtolower($upload->getClientOriginalExtension());

        if (! in_array($ext, $allowed, true) || ! isset(self::MIME_MAP[$ext])) {
            return 'Dateityp nicht erlaubt.';
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($upload->getRealPath()) ?: 'application/octet-stream';

        if (! in_array($mime, self::MIME_MAP[$ext], true)) {
            return 'Dateiinhalt passt nicht zur Erweiterung.';
        }

        if (str_starts_with($mime, 'image/') && @getimagesize($upload->getRealPath()) === false) {
            return 'Ungültige Bilddatei.';
        }

        if (in_array($ext, ['docx', 'xlsx'], true)) {
            $zip = new \ZipArchive;

            if ($zip->open($upload->getRealPath()) !== true || $zip->locateName($ext === 'docx' ? 'word/document.xml' : 'xl/workbook.xml') === false) {
                return 'Ungültige Office-Datei.';
            }

            $zip->close();
            $mime = $ext === 'docx' ? self::MIME_MAP['docx'][0] : self::MIME_MAP['xlsx'][0];
        }

        if ($ext === 'pdf' || str_starts_with($mime, 'text/')) {
            $mime = $ext === 'csv' ? 'text/csv' : $mime;
        }

        return ['ext' => $ext, 'mime' => $mime];
    }

    /**
     * @return array<string, mixed>
     */
    private function info(UserFile $f): array
    {
        return [
            'id' => $f->id,
            'name' => $f->original_name,
            'mime' => $f->mime,
            'kind' => $f->kind,
            'size' => $f->size,
            'status' => $f->status,
            'status_message' => $f->status_message,
            'project_id' => $f->project_id,
            'in_knowledge_base' => $f->in_knowledge_base,
            'created_at' => $f->created_at?->toIso8601String(),
        ];
    }

    public function status(Request $request): JsonResponse
    {
        $ids = array_filter(array_map('intval', explode(',', (string) $request->query('ids'))));

        return response()->json($request->user()->files()->whereIn('id', $ids)->get()->map(fn ($f) => $this->info($f)));
    }

    public function show(Request $request, UserFile $file): StreamedResponse
    {
        Gate::authorize('view', $file);

        $inline = ! $request->boolean('download') && (in_array($file->mime, ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'], true) || str_starts_with($file->mime, 'audio/'));

        return Storage::disk($file->disk)->response(
            $file->path,
            $file->original_name,
            ['Content-Type' => $file->mime, 'Content-Security-Policy' => "default-src 'none'; sandbox", 'X-Content-Type-Options' => 'nosniff'],
            $inline ? 'inline' : 'attachment',
        );
    }

    public function update(Request $request, UserFile $file): JsonResponse
    {
        Gate::authorize('update', $file);
        $data = $request->validate(['in_knowledge_base' => ['required', 'boolean']]);

        abort_unless($file->project_id, 422, 'Nur Projektdateien können zur Wissensdatenbank gehören.');
        $file->update($data);

        if ($data['in_knowledge_base']) {
            ProcessFileJob::dispatch($file->id);
        } else {
            $file->chunks()->delete();
        }

        return response()->json($this->info($file));
    }

    public function destroy(UserFile $file): JsonResponse
    {
        Gate::authorize('delete', $file);
        $file->delete();

        return response()->json(['ok' => true]);
    }
}
