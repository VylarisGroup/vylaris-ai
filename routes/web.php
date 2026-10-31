<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\MemoryController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\VoiceController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check() ? redirect()->route('chat.index') : redirect()->route('login'));
Route::get('/dashboard', fn () => redirect()->route('chat.index'))->middleware('auth')->name('dashboard');

Route::middleware('guest')->group(function () {
    Route::get('/auth/{provider}/redirect', [SocialLoginController::class, 'redirect'])->name('oauth.redirect');
});
Route::get('/auth/{provider}/callback', [SocialLoginController::class, 'callback'])->middleware('guest')->name('oauth.callback');

// Konto & Datenschutz (auch ohne E-Mail-Verifizierung erreichbar)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [PrivacyController::class, 'destroyAccount'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified.required'])->group(function () {
    // Chat
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{chat}', [ChatController::class, 'show'])->name('chat.show');
    Route::get('/chats/search', [ChatController::class, 'search'])->name('chats.search');
    Route::get('/chats/{chat}/title', [ChatController::class, 'title'])->name('chats.title');
    Route::patch('/chats/{chat}', [ChatController::class, 'update'])->name('chats.update');
    Route::delete('/chats/{chat}', [ChatController::class, 'destroy'])->name('chats.destroy');

    Route::middleware('throttle:chat')->group(function () {
        Route::post('/chat/stream', [ChatController::class, 'stream'])->name('chat.stream');
        Route::post('/chats/{chat}/regenerate', [ChatController::class, 'regenerate'])->name('chats.regenerate');
        Route::post('/messages/{message}/edit', [ChatController::class, 'edit'])->name('messages.edit');
    });

    Route::post('/messages/{message}/rating', [ChatController::class, 'rate'])->name('messages.rate');
    Route::post('/messages/{message}/export', [ChatController::class, 'export'])->name('messages.export');

    // Ordner, Projekte
    Route::post('/folders', [FolderController::class, 'store'])->name('folders.store');
    Route::patch('/folders/{folder}', [FolderController::class, 'update'])->name('folders.update');
    Route::delete('/folders/{folder}', [FolderController::class, 'destroy'])->name('folders.destroy');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::patch('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Dateien
    Route::get('/files', [FileController::class, 'index'])->name('files.index');
    Route::post('/files', [FileController::class, 'store'])->middleware('throttle:uploads')->name('files.store');
    Route::get('/files/status', [FileController::class, 'status'])->name('files.status');
    Route::get('/files/{file}', [FileController::class, 'show'])->name('files.show');
    Route::patch('/files/{file}', [FileController::class, 'update'])->name('files.update');
    Route::delete('/files/{file}', [FileController::class, 'destroy'])->name('files.destroy');

    // Sprache
    Route::middleware('throttle:voice')->group(function () {
        Route::post('/voice/transcribe', [VoiceController::class, 'transcribe'])->name('voice.transcribe');
        Route::post('/voice/speak', [VoiceController::class, 'speak'])->name('voice.speak');
    });

    // Einstellungen
    Route::get('/settings', [PreferencesController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [PreferencesController::class, 'update'])->name('settings.update');
    Route::get('/settings/memory', [MemoryController::class, 'index'])->name('memory.index');
    Route::post('/settings/memory', [MemoryController::class, 'store'])->name('memory.store');
    Route::patch('/settings/memory/{memory}', [MemoryController::class, 'update'])->name('memory.update');
    Route::delete('/settings/memory/{memory}', [MemoryController::class, 'destroy'])->name('memory.destroy');
    Route::delete('/settings/memory', [MemoryController::class, 'clear'])->name('memory.clear');

    Route::get('/settings/privacy', [PrivacyController::class, 'index'])->name('privacy.index');
    Route::post('/settings/privacy/export', [PrivacyController::class, 'requestExport'])->middleware('throttle:3,60')->name('privacy.export');
    Route::get('/settings/privacy/export/download', [PrivacyController::class, 'downloadExport'])->name('privacy.export.download');
    Route::delete('/settings/privacy/chats', [PrivacyController::class, 'destroyChats'])->name('privacy.chats.destroy');
});

// Admin
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified.required', 'permission:admin.access', 'throttle:api-admin'])->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('permission:admin.providers')->group(function () {
        Route::get('/providers', [Admin\ProviderController::class, 'index'])->name('providers.index');
        Route::post('/providers', [Admin\ProviderController::class, 'store'])->name('providers.store');
        Route::post('/providers/from-template', [Admin\ProviderController::class, 'fromTemplate'])->name('providers.template');
        Route::patch('/providers/{provider}', [Admin\ProviderController::class, 'update'])->name('providers.update');
        Route::delete('/providers/{provider}', [Admin\ProviderController::class, 'destroy'])->name('providers.destroy');
        Route::post('/providers/{provider}/test', [Admin\ProviderController::class, 'test'])->name('providers.test');
        Route::post('/providers/{provider}/discover', [Admin\ProviderController::class, 'discover'])->name('providers.discover');
        Route::post('/providers/{provider}/models', [Admin\ModelController::class, 'store'])->name('models.store');
        Route::patch('/models/{model}', [Admin\ModelController::class, 'update'])->name('models.update');
        Route::delete('/models/{model}', [Admin\ModelController::class, 'destroy'])->name('models.destroy');
    });

    Route::middleware('permission:admin.features')->group(function () {
        Route::get('/features', [Admin\FeatureController::class, 'index'])->name('features.index');
        Route::patch('/features/{feature}', [Admin\FeatureController::class, 'update'])->name('features.update');
        Route::get('/agents', [Admin\AgentController::class, 'index'])->name('agents.index');
        Route::post('/agents', [Admin\AgentController::class, 'store'])->name('agents.store');
        Route::patch('/agents/{agent}', [Admin\AgentController::class, 'update'])->name('agents.update');
        Route::delete('/agents/{agent}', [Admin\AgentController::class, 'destroy'])->name('agents.destroy');
    });

    Route::middleware('permission:admin.users')->group(function () {
        Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
        Route::post('/users', [Admin\UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [Admin\UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/roles', [Admin\RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [Admin\RoleController::class, 'store'])->name('roles.store');
        Route::patch('/roles/{role}', [Admin\RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [Admin\RoleController::class, 'destroy'])->name('roles.destroy');
    });

    Route::middleware('permission:admin.settings')->group(function () {
        Route::get('/settings', [Admin\SettingController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [Admin\SettingController::class, 'update'])->name('settings.update');
    });

    Route::middleware('permission:admin.logs')->group(function () {
        Route::get('/usage', [Admin\LogController::class, 'usage'])->name('usage');
        Route::get('/errors', [Admin\LogController::class, 'errors'])->name('errors');
        Route::get('/audit', [Admin\LogController::class, 'audit'])->name('audit');
        Route::post('/logs/prune', [Admin\LogController::class, 'prune'])->name('logs.prune');
        Route::get('/system', [Admin\DashboardController::class, 'system'])->name('system');
    });
});

require __DIR__.'/auth.php';
