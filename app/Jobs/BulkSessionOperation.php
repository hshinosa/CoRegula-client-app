<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BulkSessionOperation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        private string $operation,
        private array $sessionIds,
    ) {}

    public function handle(): void
    {
        try {
            $apiUrl = config('services.core_api.url', 'http://localhost:3000');
            $response = Http::timeout(60)->post("{$apiUrl}/api/learning-sessions/bulk/{$this->operation}", [
                'session_ids' => $this->sessionIds,
            ]);

            if ($response->successful()) {
                $processed = $response->json('processed', 0);
                Log::info("BulkSessionOperation: {$this->operation} processed {$processed} sessions");
            } else {
                Log::error('BulkSessionOperation: API request failed', [
                    'operation' => $this->operation,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('BulkSessionOperation: failed', [
                'operation' => $this->operation,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
