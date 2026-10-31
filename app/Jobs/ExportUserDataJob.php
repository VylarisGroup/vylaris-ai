<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\DataExportReady;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

/**
 * Erstellt ein vollständiges Export-Archiv (JSON + Dateien) der Daten eines Benutzers (DSGVO/DSG Auskunft & Portabilität).
 */
class ExportUserDataJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 600;

    public function __construct(public int $userId) {}

    public function handle(): void
    {
        $user = User::find($this->userId);

        if (! $user) {
            return;
        }

        $data = [
            'exportiert_am' => now()->toIso8601String(),
            'profil' => $user->only(['name', 'email', 'about_me', 'custom_instructions', 'preferences', 'created_at']),
            'ordner' => $user->folders()->get(['id', 'name'])->toArray(),
            'projekte' => $user->projects()->get(['id', 'name', 'description', 'instructions', 'created_at'])->toArray(),
            'memory' => $user->memories()->get(['content', 'source', 'created_at'])->toArray(),
            'chats' => $user->chats()->with(['messages' => fn ($q) => $q->select(['id', 'chat_id', 'role', 'content', 'sources', 'rating', 'created_at'])])->get()->map(fn ($chat) => [
                'titel' => $chat->title,
                'favorit' => $chat->is_favorite,
                'archiviert' => $chat->archived_at,
                'erstellt' => $chat->created_at,
                'nachrichten' => $chat->messages->toArray(),
            ])->all(),
            'dateien' => $user->files()->get(['id', 'original_name', 'mime', 'size', 'kind', 'created_at'])->toArray(),
        ];

        $dir = 'exports/'.$user->id;
        $name = 'export-'.now()->format('Ymd-His').'.zip';
        Storage::disk('private')->makeDirectory($dir);
        $zipPath = Storage::disk('private')->path($dir.'/'.$name);

        $zip = new ZipArchive;
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('daten.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        foreach ($user->files()->get() as $file) {
            if (Storage::disk($file->disk)->exists($file->path)) {
                $zip->addFile(Storage::disk($file->disk)->path($file->path), 'dateien/'.$file->id.'-'.basename($file->original_name));
            }
        }

        $zip->close();

        $user->update(['preferences' => array_merge($user->preferences ?? [], ['last_export' => $dir.'/'.$name])]);
        $user->notify(new DataExportReady);

        foreach (Storage::disk('private')->files($dir) as $old) {
            if ($old !== $dir.'/'.$name && Storage::disk('private')->lastModified($old) < now()->subDays(7)->timestamp) {
                Storage::disk('private')->delete($old);
            }
        }
    }
}
