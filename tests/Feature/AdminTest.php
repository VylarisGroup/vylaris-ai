<?php

namespace Tests\Feature;

use App\Models\AiModel;
use App\Models\AuditLog;
use App\Models\Feature;
use App\Models\Provider;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();
    }

    public function test_regular_users_cannot_enter_admin_area(): void
    {
        $user = $this->makeUser();

        foreach (['/admin', '/admin/providers', '/admin/users', '/admin/features', '/admin/settings', '/admin/usage'] as $url) {
            $this->actingAs($user)->get($url)->assertForbidden();
        }

        $this->actingAs($user)->post('/admin/providers', [])->assertForbidden();
    }

    public function test_admin_pages_render_and_api_keys_are_never_sent_to_the_browser(): void
    {
        $admin = $this->makeUser('admin');
        Provider::factory()->create(['api_key' => 'sk-super-secret', 'extra_headers' => ['X-Org' => 'geheim-header']]);

        $response = $this->actingAs($admin)->get('/admin/providers');

        $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Providers')->where('providers.0.has_key', true));
        $this->assertStringNotContainsString('sk-super-secret', $response->getContent());
        $this->assertStringNotContainsString('geheim-header', $response->getContent());

        foreach (['/admin', '/admin/features', '/admin/users', '/admin/roles', '/admin/settings', '/admin/agents', '/admin/usage', '/admin/errors', '/admin/audit', '/admin/system'] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_api_key_is_stored_encrypted(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)->post('/admin/providers', [
            'name' => 'Test', 'driver' => 'openai_compatible', 'base_url' => 'https://api.openai.com/v1', 'api_key' => 'sk-plain', 'is_enabled' => true, 'is_fallback' => false,
        ])->assertRedirect();

        $raw = \DB::table('providers')->value('api_key');
        $this->assertStringNotContainsString('sk-plain', $raw);
        $this->assertSame('sk-plain', Provider::first()->api_key);
        $this->assertTrue(AuditLog::where('action', 'provider.created')->exists());
    }

    public function test_provider_rejects_local_and_insecure_urls(): void
    {
        $admin = $this->makeUser('admin');

        foreach (['http://api.openai.com/v1', 'https://localhost:11434/v1', 'https://127.0.0.1/v1', 'https://192.168.1.10/v1', 'https://169.254.169.254/latest'] as $url) {
            $this->actingAs($admin)->post('/admin/providers', ['name' => 'X', 'driver' => 'openai_compatible', 'base_url' => $url, 'is_enabled' => true, 'is_fallback' => false])
                ->assertSessionHasErrors('base_url');
        }
    }

    public function test_model_with_capabilities_can_be_registered_and_assigned_to_features(): void
    {
        $admin = $this->makeUser('admin');
        $provider = Provider::factory()->create();

        $this->actingAs($admin)->post("/admin/providers/{$provider->id}/models", [
            'model_id' => 'whisper-1', 'display_name' => 'Whisper', 'tier' => 'fast', 'is_enabled' => true,
            'capabilities' => [['capability' => 'stt']],
        ])->assertRedirect();

        $model = AiModel::where('model_id', 'whisper-1')->first();
        $this->assertTrue($model->hasCapability('stt'));

        $stt = Feature::where('key', 'stt')->first();
        $this->actingAs($admin)->patch("/admin/features/{$stt->id}", ['is_enabled' => true, 'ai_model_id' => $model->id, 'config' => ['languages' => ['de']]])->assertRedirect();
        $this->assertSame($model->id, $stt->fresh()->ai_model_id);

        // Modell ohne passende Capability wird abgelehnt
        $chat = $this->makeChatModel();
        $tts = Feature::where('key', 'tts')->first();
        $this->actingAs($admin)->patch("/admin/features/{$tts->id}", ['is_enabled' => true, 'ai_model_id' => $chat->id])->assertStatus(422);
    }

    public function test_feature_can_be_restricted_to_roles(): void
    {
        $this->actingAs($this->makeUser('admin'));
        $feature = Feature::where('key', 'memory')->first();
        $premium = Role::create(['name' => 'Premium', 'slug' => 'premium', 'permissions' => ['chat.use']]);
        $feature->roles()->sync([$premium->id]);

        $this->assertFalse($feature->fresh()->availableTo($this->makeUser('user')));
        $this->assertTrue($feature->fresh()->availableTo($this->makeUser('user', ['role_id' => $premium->id])));
    }

    public function test_last_admin_cannot_be_demoted_or_deleted(): void
    {
        $admin = $this->makeUser('admin');
        $userRole = Role::where('slug', 'user')->first();

        $this->actingAs($admin)->patch("/admin/users/{$admin->id}", ['name' => 'A', 'role_id' => $userRole->id, 'is_active' => true])->assertStatus(422);
        $this->actingAs($admin)->delete("/admin/users/{$admin->id}")->assertStatus(422);
    }

    public function test_admin_can_manage_users_and_roles(): void
    {
        $admin = $this->makeUser('admin');
        $user = $this->makeUser();

        $this->actingAs($admin)->patch("/admin/users/{$user->id}", ['name' => 'Neu', 'role_id' => $user->role_id, 'is_active' => false, 'limit_overrides' => ['messages_per_day' => 5]])->assertRedirect();
        $this->assertFalse($user->fresh()->is_active);
        $this->assertSame(5, $user->fresh()->limit('messages_per_day'));

        $this->actingAs($admin)->post('/admin/roles', ['name' => 'Gast', 'permissions' => ['chat.use'], 'limits' => ['messages_per_day' => 10]])->assertRedirect();
        $this->assertTrue(Role::where('name', 'Gast')->first()->hasPermission('chat.use'));
        $this->assertFalse(Role::where('name', 'Gast')->first()->hasPermission('admin.access'));
    }

    public function test_settings_secrets_are_masked_and_encrypted(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)->patch('/admin/settings', ['values' => ['oauth_github_client_secret' => 'topsecret', 'site_name' => 'Meine KI']])->assertRedirect();

        $this->assertSame('topsecret', app(\App\Services\SettingsService::class)->get('oauth_github_client_secret'));
        $this->assertStringNotContainsString('topsecret', \DB::table('settings')->where('key', 'oauth_github_client_secret')->value('value'));
        $this->actingAs($admin)->get('/admin/settings')->assertInertia(fn (Assert $p) => $p->where('values.oauth_github_client_secret', '********')->where('values.site_name', 'Meine KI'));
    }

    public function test_provider_connection_test_reports_success_and_failure(): void
    {
        $admin = $this->makeUser('admin');
        $model = $this->makeChatModel();

        Http::fake(['*' => Http::sequence()->push(['choices' => [['message' => ['content' => 'pong']]]], 200)->push(['error' => ['message' => 'bad key']], 401)]);

        $this->actingAs($admin)->postJson("/admin/providers/{$model->provider_id}/test", ['model_id' => $model->id])->assertJsonPath('ok', true);
        $this->actingAs($admin)->postJson("/admin/providers/{$model->provider_id}/test", ['model_id' => $model->id])->assertJsonPath('ok', false);
    }

    public function test_registration_can_be_disabled(): void
    {
        app(\App\Services\SettingsService::class)->set('registration_enabled', false);

        $this->get('/register')->assertForbidden();
        $this->post('/register', ['name' => 'X', 'email' => 'x@example.com', 'password' => 'password123', 'password_confirmation' => 'password123'])->assertForbidden();
        $this->assertSame(0, User::where('email', 'x@example.com')->count());
    }
}
