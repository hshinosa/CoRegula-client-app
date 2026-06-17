<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SessionNotificationService
{
    private string $apiUrl;

    public function __construct()
    {
        $this->apiUrl = config('services.core_api.url', 'http://localhost:3000');
    }

    public function sendAutoCloseWarning(string $sessionId, int $minutesRemaining): bool
    {
        try {
            $response = Http::timeout(10)->connectTimeout(5)->post("{$this->apiUrl}/api/notifications/session-auto-close-warning", [
                'session_id' => $sessionId,
                'minutes_remaining' => $minutesRemaining,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('SessionNotificationService: failed to send auto-close warning', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function sendSessionActivated(string $sessionId): bool
    {
        try {
            $response = Http::timeout(10)->connectTimeout(5)->post("{$this->apiUrl}/api/notifications/session-activated", [
                'session_id' => $sessionId,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('SessionNotificationService: failed to send session activated notification', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function sendSessionClosed(string $sessionId, string $reason): bool
    {
        try {
            $response = Http::timeout(10)->connectTimeout(5)->post("{$this->apiUrl}/api/notifications/session-closed", [
                'session_id' => $sessionId,
                'reason' => $reason,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('SessionNotificationService: failed to send session closed notification', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
