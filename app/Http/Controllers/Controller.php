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

    protected function coreApiRequest(int $timeout = 10, int $connectTimeout = 5)
    {
        return Http::timeout($timeout)->connectTimeout($connectTimeout);
    }

    /**
     * Forward a Core API client response to the frontend, invalidating the
     * Laravel session if Core returned 401 (token revoked mid-session).
     */
    protected function proxyResponse(\Illuminate\Http\Client\Response $response): \Illuminate\Http\JsonResponse
    {
        if ($response->status() === 401) {
            session()->forget(['jwt', 'refresh_token', 'user']);
        }
        return response()->json($response->json(), $response->status());
    }
}
