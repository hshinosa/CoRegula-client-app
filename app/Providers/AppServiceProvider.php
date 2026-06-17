<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Force HTTPS when APP_URL uses https (fixes mixed content behind reverse proxy)
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        Http::globalOptions([
            'curl' => [
                CURLOPT_TCP_KEEPALIVE => 1,
                CURLOPT_TCP_KEEPIDLE => 120,
                CURLOPT_TCP_KEEPINTVL => 60,
            ],
        ]);
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
