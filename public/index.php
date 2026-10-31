<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Erstinstallation: ohne .env/APP_KEY zum Web-Installer weiterleiten (solange install.php existiert)...
if (is_file(__DIR__.'/install.php')
    && ! is_file(__DIR__.'/../storage/app/installed.lock')
    && ! preg_match('/^APP_KEY=.+/m', (string) @file_get_contents(__DIR__.'/../.env'))) {
    header('Location: '.rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\').'/install.php');
    exit;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
