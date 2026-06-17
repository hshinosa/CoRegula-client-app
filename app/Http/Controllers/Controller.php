<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
            ->withHeaders($this->forwardedHeaders())
            ->timeout($timeout)
            ->connectTimeout($connectTimeout);
    }

    protected function coreApiRequest(int $timeout = 10, int $connectTimeout = 5)
    {
        return Http::withHeaders($this->forwardedHeaders())
            ->timeout($timeout)
            ->connectTimeout($connectTimeout);
    }

    protected function proxyResponse(\Illuminate\Http\Client\Response $response): \Illuminate\Http\JsonResponse
    {
        if ($response->status() === 401) {
            session()->forget(['jwt', 'refresh_token', 'user']);
        }
        return response()->json($response->json(), $response->status());
    }

    private function forwardedHeaders(): array
    {
        $headers = [];
        $ip = request()->ip();

        if ($ip) {
            $headers['X-Forwarded-For'] = $ip;
        }

        $requestId = request()->attributes->get('request_id');
        if ($requestId) {
            $headers['X-Request-ID'] = $requestId;
        }

        return $headers;
    }
}
