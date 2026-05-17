<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

abstract class Controller
{
    protected function apiUrl(): string
    {
        return config('services.api.base_url', 'http://localhost:3000');
    }

    protected function apiRequest(int $timeout = 10, int $connectTimeout = 5)
    {
        return Http::withToken(session('jwt'))
            ->timeout($timeout)
            ->connectTimeout($connectTimeout);
    }
}
