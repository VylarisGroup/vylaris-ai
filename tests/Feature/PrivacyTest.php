<?php

namespace Tests\Feature;

use App\Jobs\ExportUserDataJob;
use App\Models\Chat;
use App\Models\Memory;
use App\Models\Message;
use App\Models\User;
use App\Models\UserFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class PrivacyTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
        Storage::fake('private');
    }

    public function test_export_contains_only_own_data(): void
    {
        Notification::fake();
        $user = $this->makeUser();
        $other = $this->makeUser();
        $chat = Chat::factory()->create(['user_id' => $user->id, 'title' => 'Mein Chat']);
        Message::create(['chat_id' => $chat->id, 'role' => 'user', 'content' => 'meine frage']);
        Memory::create(['user_id' => $user->id, 'content' => 'mag Kaffee']);
        $otherChat = Chat::factory()->create(['user_id' => $other->id, 'title' => 'Fremder Chat']);
        Message::create(['chat_id' => $otherChat->id, 'role' => 'user', 'content' => 'fremde frage']);

        (new ExportUserDataJob($user->id))->handle();

        $path = $user->fresh()->preference('last_export');
        $zip = new \ZipArchive;
        $zip->open(Storage::disk('private')->path($path));
        $json = $zip->getFromName('daten.json');

        $this->assertStringContainsString('meine frage', $json);
        $this->assertStringContainsString('mag Kaffee', $json);
        $this->assertStringNotContainsString('fremde frage', $json);
        $this->assertStringNotContainsString('Fremder Chat', $json);
        Notification::assertSentTo($user, \App\Notifications\DataExportReady::class);
    }

    public function test_export_download_is_limited_to_owner(): void
    {
        $user = $this->makeUser();
        Storage::disk('private')->put("exports/{$user->id}/e.zip", 'zip');
        $user->update(['preferences' => ['last_export' => "exports/{$user->id}/e.zip"]]);
        $other = $this->makeUser();
        $other->update(['preferences' => ['last_export' => "exports/{$user->id}/e.zip"]]);

        $this->actingAs($user)->get('/settings/privacy/export/download')->assertOk();
        $this->actingAs($other)->get('/settings/privacy/export/download')->assertNotFound();
    }

    public function test_account_deletion_removes_all_data_and_files(): void
    {
        $this->makeUser('admin');
        $user = $this->makeUser('user', ['password' => 'geheim-passwort']);
        Storage::disk('private')->put("uploads/{$user->id}/a.txt", 'x');
        UserFile::factory()->create(['user_id' => $user->id, 'path' => "uploads/{$user->id}/a.txt"]);
        $chat = Chat::factory()->create(['user_id' => $user->id]);
        Message::create(['chat_id' => $chat->id, 'role' => 'user', 'content' => 'x']);
        Memory::create(['user_id' => $user->id, 'content' => 'fakt']);

        $this->actingAs($user)->delete('/profile', ['password' => 'falsch'])->assertSessionHasErrors('password');
        $this->actingAs($user)->delete('/profile', ['password' => 'geheim-passwort'])->assertRedirect('/');

        $this->assertNull(User::find($user->id));
        $this->assertSame(0, Chat::where('user_id', $user->id)->count());
        $this->assertSame(0, Memory::where('user_id', $user->id)->count());
        $this->assertSame(0, UserFile::where('user_id', $user->id)->count());
        Storage::disk('private')->assertMissing("uploads/{$user->id}/a.txt");
    }

    public function test_memory_is_transparent_and_deletable(): void
    {
        $user = $this->makeUser();
        $memory = Memory::create(['user_id' => $user->id, 'content' => 'fakt']);

        $this->actingAs($user)->get('/settings/memory')->assertOk();
        $this->actingAs($this->makeUser())->delete("/settings/memory/{$memory->id}")->assertForbidden();
        $this->actingAs($user)->delete("/settings/memory/{$memory->id}")->assertRedirect();
        $this->assertSame(0, Memory::count());
    }
}
