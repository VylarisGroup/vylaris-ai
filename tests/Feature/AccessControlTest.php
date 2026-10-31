<?php

namespace Tests\Feature;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Models\UserFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
    }

    public function test_users_cannot_access_foreign_chats_files_or_messages(): void
    {
        $owner = $this->makeUser();
        $intruder = $this->makeUser();
        $chat = Chat::factory()->create(['user_id' => $owner->id]);
        $message = Message::create(['chat_id' => $chat->id, 'role' => 'assistant', 'content' => 'geheim']);
        $file = UserFile::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($intruder)->get("/chat/{$chat->id}")->assertForbidden();
        $this->actingAs($intruder)->patch("/chats/{$chat->id}", ['title' => 'x'])->assertForbidden();
        $this->actingAs($intruder)->delete("/chats/{$chat->id}")->assertForbidden();
        $this->actingAs($intruder)->post("/messages/{$message->id}/rating", ['rating' => 'up'])->assertForbidden();
        $this->actingAs($intruder)->get("/files/{$file->id}")->assertForbidden();
        $this->actingAs($intruder)->delete("/files/{$file->id}")->assertForbidden();
        $this->actingAs($intruder)->postJson('/chat/stream', ['content' => 'x', 'chat_id' => $chat->id])->assertStatus(422);
    }

    public function test_chat_search_only_returns_own_chats(): void
    {
        $owner = $this->makeUser();
        $other = $this->makeUser();
        $chat = Chat::factory()->create(['user_id' => $owner->id, 'title' => 'Steuererklärung']);
        Chat::factory()->create(['user_id' => $other->id, 'title' => 'Steuerfrage fremd']);

        $this->actingAs($owner)->getJson('/chats/search?q=Steuer')->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $chat->id);
    }

    public function test_rating_is_stored(): void
    {
        $user = $this->makeUser();
        $chat = Chat::factory()->create(['user_id' => $user->id]);
        $message = Message::create(['chat_id' => $chat->id, 'role' => 'assistant', 'content' => 'a']);

        $this->actingAs($user)->postJson("/messages/{$message->id}/rating", ['rating' => 'down', 'comment' => 'falsch'])->assertOk();

        $this->assertSame('down', $message->fresh()->rating);
    }

    public function test_unverified_users_are_sent_to_verification_when_required(): void
    {
        $user = $this->makeUser('user', ['email_verified_at' => null]);

        $this->actingAs($user)->get('/chat')->assertRedirect(route('verification.notice'));
    }

    public function test_deactivated_users_are_logged_out(): void
    {
        $user = $this->makeUser('user', ['is_active' => false]);

        $this->actingAs($user)->get('/chat')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_new_user_gets_default_role_and_first_user_becomes_admin(): void
    {
        User::query()->delete();
        $first = User::factory()->create(['role_id' => null]);
        $second = User::factory()->create(['role_id' => null]);

        $this->assertSame('admin', $first->fresh()->role->slug);
        $this->assertSame('user', $second->fresh()->role->slug);
    }
}
