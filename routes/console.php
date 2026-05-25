<?php

use App\Jobs\ActivateScheduledSessions;
use App\Jobs\AutoCloseInactiveSessions;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new ActivateScheduledSessions())->everyMinute();
Schedule::job(new AutoCloseInactiveSessions())->everyFiveMinutes();
