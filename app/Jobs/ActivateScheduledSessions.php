<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ActivateScheduledSessions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function handle(): void
    {
        try {
            $apiUrl = config('services.core_api.url', 'http://localhost:3000');
            $response = Http::timeout(30)->connectTimeout(5)
                ->post("{$apiUrl}/api/learning-sessions/activate-scheduled");

            if ($response->successful()) {
                $activated = $response->json('activated', 0);
                Log::info("ActivateScheduledSessions: activated {$activated} sessions");
            } else {
                Log::error('ActivateScheduledSessions: API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('ActivateScheduledSessions: failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
