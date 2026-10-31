<?php

namespace Tests\Feature;

use App\Jobs\ProcessFileJob;
use App\Models\UserFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class FileUploadTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
        Storage::fake('private');
    }

    public function test_multiple_files_are_stored_privately_and_processed(): void
    {
        Queue::fake();
        $user = $this->makeUser();

        $response = $this->actingAs($user)->postJson('/files', ['files' => [
            UploadedFile::fake()->createWithContent('daten.csv', "name;wert\na;1\nb;2\n"),
            UploadedFile::fake()->createWithContent('notiz.txt', 'Hallo Welt'),
            UploadedFile::fake()->image('foto.png', 20, 20),
        ]]);

        $response->assertCreated()->assertJsonCount(3, 'files');
        $this->assertSame(3, $user->files()->count());
        Queue::assertPushed(ProcessFileJob::class, 3);

        foreach ($user->files as $file) {
            Storage::disk('private')->assertExists($file->path);
            $this->assertStringStartsWith('uploads/'.$user->id.'/', $file->path);
        }
    }

    public function test_disallowed_and_disguised_files_are_rejected(): void
    {
        Queue::fake();
        $user = $this->makeUser();

        $response = $this->actingAs($user)->postJson('/files', ['files' => [
            UploadedFile::fake()->createWithContent('skript.php', '<?php echo 1;'),
            UploadedFile::fake()->createWithContent('bild.png', '<?php system($_GET["c"]);'),
            UploadedFile::fake()->createWithContent('fake.docx', 'kein zip'),
            UploadedFile::fake()->createWithContent('vektor.svg', '<svg onload="alert(1)"/>'),
        ]]);

        $response->assertStatus(422)->assertJsonCount(4, 'errors');
        $this->assertSame(0, UserFile::count());
    }

    public function test_upload_limit_per_day_is_enforced(): void
    {
        Queue::fake();
        $user = $this->makeUser('user', ['limit_overrides' => ['uploads_per_day' => 1]]);

        $this->actingAs($user)->postJson('/files', ['files' => [UploadedFile::fake()->createWithContent('a.txt', 'a'), UploadedFile::fake()->createWithContent('b.txt', 'b')]])->assertStatus(429);
    }

    public function test_processing_extracts_text_from_csv_and_txt(): void
    {
        $user = $this->makeUser();
        Storage::disk('private')->put('uploads/1/a.csv', "name;wert\nAlpha;10\nBeta;20\n");
        $file = UserFile::factory()->create(['user_id' => $user->id, 'path' => 'uploads/1/a.csv', 'original_name' => 'a.csv', 'mime' => 'text/csv', 'status' => 'pending', 'extracted_text' => null]);

        (new ProcessFileJob($file->id))->handle(app(\App\Services\Files\DocumentExtractor::class), app(\App\Services\Files\Chunker::class), app(\App\Services\Features\FeatureManager::class), app(\App\Services\Ai\AiGateway::class));

        $this->assertSame('ready', $file->fresh()->status);
        $this->assertStringContainsString('Alpha | 10', $file->fresh()->makeVisible('extracted_text')->extracted_text);
    }

    public function test_files_are_served_only_to_owner_with_safe_headers(): void
    {
        $owner = $this->makeUser();
        Storage::disk('private')->put('uploads/1/x.txt', 'inhalt');
        $file = UserFile::factory()->create(['user_id' => $owner->id, 'path' => 'uploads/1/x.txt']);

        $this->actingAs($this->makeUser())->get("/files/{$file->id}")->assertForbidden();
        $this->actingAs($owner)->get("/files/{$file->id}")->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_deleting_a_file_removes_it_from_storage(): void
    {
        $owner = $this->makeUser();
        Storage::disk('private')->put('uploads/1/x.txt', 'inhalt');
        $file = UserFile::factory()->create(['user_id' => $owner->id, 'path' => 'uploads/1/x.txt']);

        $this->actingAs($owner)->deleteJson("/files/{$file->id}")->assertOk();

        Storage::disk('private')->assertMissing('uploads/1/x.txt');
    }
}
