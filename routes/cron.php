<?php

use App\Http\Controllers\CronController;
use Illuminate\Support\Facades\Route;

/*
| Cron per URL: ohne Session, CSRF und Cookies. Der Token (Admin → Updates & Cron) ersetzt die Anmeldung.
*/
Route::match(['GET', 'POST'], '/cron/{token}', CronController::class)
    ->where('token', '[A-Za-z0-9]{20,80}')
    ->middleware('throttle:cron')
    ->name('cron.run');
