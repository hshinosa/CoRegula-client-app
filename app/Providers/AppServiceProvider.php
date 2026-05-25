<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return [
                Limit::perMinutes(5, 5)->by($request->ip()),
                Limit::perHour(10)->by('login:' . $request->input('email')),
            ];
        });

        RateLimiter::for('register', function (Request $request) {
            return [
                Limit::perHour(5)->by($request->ip()),
                Limit::perDay(3)->by('register:' . $request->input('email')),
            ];
        });

        RateLimiter::for('forgot-password', function (Request $request) {
            return [
                Limit::perHour(5)->by($request->ip()),
                Limit::perHour(3)->by('forgot:' . $request->input('email')),
            ];
        });
    }
}
