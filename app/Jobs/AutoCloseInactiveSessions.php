<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoCloseInactiveSessions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function handle(): void
    {
        try {
            $apiUrl = config('services.core_api.url', 'http://localhost:3000');
            $response = Http::timeout(30)
                ->post("{$apiUrl}/api/learning-sessions/auto-close-inactive");

            if ($response->successful()) {
                $closed = $response->json('closed', 0);
                $warnings = $response->json('warnings', 0);
                Log::info("AutoCloseInactiveSessions: closed {$closed} sessions, sent {$warnings} warnings");
            } else {
                Log::error('AutoCloseInactiveSessions: API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('AutoCloseInactiveSessions: failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
