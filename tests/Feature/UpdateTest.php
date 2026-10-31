<?php

namespace Tests\Feature;

use App\Services\SettingsService;
use App\Services\Update\UpdateException;
use App\Services\Update\UpdateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\CreatesPlatform;
use Tests\TestCase;
use ZipArchive;

class UpdateTest extends TestCase
{
    use CreatesPlatform, RefreshDatabase;

    private string $base;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPlatform();

        $this->base = sys_get_temp_dir().'/vylaris-update-'.bin2hex(random_bytes(4));
        $this->writeFile('VERSION', "1.0.0\n");
        $this->writeFile('.env', 'APP_KEY=base64:secret');
        $this->writeFile('app/Old.php', 'old');
        $this->writeFile('app/Removed.php', 'to be removed');
        $this->writeFile('storage/app/keep.txt', 'keep me');
        $this->writeFile('public/build/old-asset.js', 'old asset');
        $this->writeFile('composer.lock', '{"same":true}');
    }

    protected function tearDown(): void
    {
        $this->removeDirectory($this->base);
        parent::tearDown();
    }

    private function writeFile(string $relative, string $content): void
    {
        @mkdir(dirname($this->base.'/'.$relative), 0775, true);
        file_put_contents($this->base.'/'.$relative, $content);
    }

    private function removeDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST) as $item) {
            $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
        }

        rmdir($dir);
    }

    /**
     * @param  array<string, string>  $files
     */
    private function release(string $version, array $files = [], bool $withBuild = true): string
    {
        $path = tempnam(sys_get_temp_dir(), 'rel');
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::OVERWRITE);

        $files = array_merge([
            'VERSION' => "{$version}\n", 'artisan' => '<?php', 'composer.json' => '{}', 'composer.lock' => '{"same":true}', 'bootstrap/app.php' => '<?php',
            'app/New.php' => 'new', 'app/Old.php' => 'updated', '.env' => 'APP_KEY=attacker', 'storage/app/keep.txt' => 'overwritten',
        ], $withBuild ? ['public/build/manifest.json' => '{}', 'public/build/new-asset.js' => 'new asset'] : [], $files);

        foreach ($files as $name => $content) {
            $zip->addFromString("Owner-repo-abc123/{$name}", $content);
        }

        $zip->close();
        $bytes = file_get_contents($path);
        unlink($path);

        return $bytes;
    }

    private function fakeGitHub(string $remoteVersion, string $zip): void
    {
        Http::fake([
            'raw.githubusercontent.com/*' => Http::response("{$remoteVersion}\n"),
            'api.github.com/repos/*/zipball/*' => Http::response($zip),
        ]);
    }

    private function service(): UpdateService
    {
        return new UpdateService(app(SettingsService::class), $this->base, false);
    }

    public function test_check_reports_available_only_for_a_higher_version(): void
    {
        $remote = '';
        Http::fake(['raw.githubusercontent.com/*' => function () use (&$remote) {
            return Http::response("{$remote}\n");
        }]);

        foreach (['1.0.1' => true, '1.0.0' => false, '0.9.9' => false, '1.10.0' => true] as $remote => $expected) {
            $this->assertSame($expected, $this->service()->check()['available'], "remote {$remote}");
        }
    }

    public function test_check_rejects_invalid_remote_version_and_missing_file(): void
    {
        Http::fake(['raw.githubusercontent.com/*' => Http::response('<html>nope</html>')]);
        $this->expectException(UpdateException::class);
        $this->service()->check();
    }

    public function test_missing_version_file_gives_helpful_error(): void
    {
        Http::fake(['raw.githubusercontent.com/*' => Http::response('', 404)]);

        try {
            $this->service()->check();
            $this->fail('Exception erwartet');
        } catch (UpdateException $e) {
            $this->assertStringContainsString('nicht gefunden', $e->getMessage());
        }
    }

    public function test_apply_installs_release_and_preserves_env_and_storage(): void
    {
        $this->fakeGitHub('1.1.0', $this->release('1.1.0'));

        $result = $this->service()->apply();

        $this->assertSame(['from' => '1.0.0', 'to' => '1.1.0'], ['from' => $result['from'], 'to' => $result['to']]);
        $this->assertSame("1.1.0\n", file_get_contents($this->base.'/VERSION'));
        $this->assertSame('new', file_get_contents($this->base.'/app/New.php'));
        $this->assertSame('updated', file_get_contents($this->base.'/app/Old.php'));
        $this->assertFileDoesNotExist($this->base.'/app/Removed.php');
        $this->assertFileDoesNotExist($this->base.'/public/build/old-asset.js');
        $this->assertFileExists($this->base.'/public/build/new-asset.js');
        $this->assertSame('APP_KEY=base64:secret', file_get_contents($this->base.'/.env'));
        $this->assertSame('keep me', file_get_contents($this->base.'/storage/app/keep.txt'));

        $backups = glob($this->base.'/storage/app/updates/backup-*/backup/app/Removed.php');
        $this->assertCount(1, $backups);
        $this->assertTrue($this->service()->status()['last_result']['ok']);
    }

    public function test_apply_refuses_when_remote_is_not_newer(): void
    {
        $this->fakeGitHub('1.0.0', $this->release('1.0.0'));

        $this->expectException(UpdateException::class);
        $this->service()->apply();
    }

    public function test_apply_rejects_path_traversal_archives_without_changing_anything(): void
    {
        $this->fakeGitHub('1.1.0', $this->release('1.1.0', ['../../evil.php' => 'pwned']));

        try {
            $this->service()->apply();
            $this->fail('Exception erwartet');
        } catch (UpdateException $e) {
            $this->assertStringContainsString('unzulässige Pfade', $e->getMessage());
        }

        $this->assertSame("1.0.0\n", file_get_contents($this->base.'/VERSION'));
        $this->assertFileDoesNotExist($this->base.'/app/New.php');
        $this->assertSame('1.1.0', $this->service()->status()['failed_version']);
    }

    public function test_apply_rejects_release_without_frontend_build(): void
    {
        $this->fakeGitHub('1.1.0', $this->release('1.1.0', [], false));

        try {
            $this->service()->apply();
            $this->fail('Exception erwartet');
        } catch (UpdateException $e) {
            $this->assertStringContainsString('Frontend-Build', $e->getMessage());
        }

        $this->assertFileDoesNotExist($this->base.'/app/New.php');
    }

    public function test_apply_rejects_archive_whose_version_differs_from_github(): void
    {
        $this->fakeGitHub('1.1.0', $this->release('1.0.5'));

        $this->expectException(UpdateException::class);
        $this->service()->apply();
    }

    public function test_failed_installation_is_rolled_back(): void
    {
        mkdir($this->base.'/zz/blocked', 0775, true);
        $this->fakeGitHub('1.1.0', $this->release('1.1.0', ['zz/blocked' => 'file where a directory exists']));

        try {
            $this->service()->apply();
            $this->fail('Exception erwartet');
        } catch (UpdateException) {
            // erwartet
        }

        $this->assertSame("1.0.0\n", file_get_contents($this->base.'/VERSION'));
        $this->assertSame('old', file_get_contents($this->base.'/app/Old.php'));
        $this->assertSame('to be removed', file_get_contents($this->base.'/app/Removed.php'));
        $this->assertFileDoesNotExist($this->base.'/app/New.php');
        $this->assertFileExists($this->base.'/public/build/old-asset.js');
    }

    public function test_installer_file_is_not_restored_after_installation(): void
    {
        $this->writeFile('storage/app/installed.lock', 'x');
        $this->fakeGitHub('1.1.0', $this->release('1.1.0', ['public/install.php' => '<?php // installer']));

        $this->service()->apply();

        $this->assertFileDoesNotExist($this->base.'/public/install.php');
    }

    public function test_cron_url_requires_valid_token_and_runs_scheduler(): void
    {
        $this->get('/cron/'.str_repeat('a', 40))->assertNotFound();

        app(SettingsService::class)->set('cron_token', 'TokenTokenTokenTokenToken1234');

        $this->get('/cron/WrongTokenWrongTokenWrong1234')->assertNotFound();
        $this->get('/cron/TokenTokenTokenTokenToken1234')->assertOk()->assertJson(['ok' => true, 'scheduler' => true]);
        $this->assertNotEmpty(app(SettingsService::class)->get('cron_last_run'));
    }

    public function test_cron_url_creates_no_session(): void
    {
        app(SettingsService::class)->set('cron_token', 'TokenTokenTokenTokenToken1234');

        $this->get('/cron/TokenTokenTokenTokenToken1234')->assertOk()->assertCookieMissing(config('session.cookie'));
    }

    public function test_update_pages_require_permission(): void
    {
        $this->actingAs($this->makeUser('user'))->get('/admin/updates')->assertForbidden();
        $this->actingAs($this->makeUser('user'))->post('/admin/updates/apply')->assertForbidden();
    }

    public function test_admin_sees_update_page_check_and_can_regenerate_cron_token(): void
    {
        $admin = $this->makeUser('admin');
        Http::fake(['raw.githubusercontent.com/*' => Http::response("99.0.0\n")]);

        $this->actingAs($admin)->post('/admin/updates/check')->assertRedirect()->assertSessionHas('success');

        $this->actingAs($admin)->get('/admin/updates')->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Updates')
            ->where('available', true)
            ->where('remote', '99.0.0')
            ->where('settings.repo', 'VylarisGroup/vylaris-ai'));

        $old = app(SettingsService::class)->get('cron_token');
        $this->actingAs($admin)->post('/admin/updates/cron-token')->assertRedirect();
        $this->assertNotSame($old, app(SettingsService::class)->get('cron_token'));
    }

    public function test_update_settings_validate_repository_and_keep_token_secret(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)->patch('/admin/updates/settings', ['repo' => 'not a repo', 'branch' => 'main', 'auto' => true])->assertSessionHasErrors('repo');
        $this->actingAs($admin)->patch('/admin/updates/settings', ['repo' => 'Org/app', 'branch' => '../x', 'auto' => true])->assertSessionHasErrors('branch');

        $this->actingAs($admin)->patch('/admin/updates/settings', ['repo' => 'Org/app', 'branch' => 'release', 'auto' => false, 'token' => 'ghp_secret'])->assertSessionHasNoErrors();

        $this->assertSame('ghp_secret', app(SettingsService::class)->get('update_token'));
        $this->assertDatabaseMissing('settings', ['key' => 'update_token', 'value' => 'ghp_secret']);
        $this->actingAs($admin)->get('/admin/updates')->assertInertia(fn (Assert $page) => $page->where('settings.has_token', true)->missing('settings.token'));
    }
}
