<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 20);

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/notifications', [
                'limit' => $limit,
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'status' => $response->status(),
                'message' => 'Failed to fetch notifications',
                'data' => [],
            ], $response->status());
        } catch (ConnectionException $e) {
            Log::error('Notifications fetch failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 500,
                'message' => 'Internal server error',
                'data' => [],
            ], 500);
        } catch (RequestException $e) {
            Log::error('Notifications fetch failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 500,
                'message' => 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/notifications/{$id}/read");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'status' => $response->status(),
                'message' => 'Failed to mark notification as read',
            ], $response->status());
        } catch (ConnectionException $e) {
            Log::error('Mark notification read failed', ['error' => $e->getMessage(), 'id' => $id]);
            return response()->json([
                'status' => 500,
                'message' => 'Internal server error',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Mark notification read failed', ['error' => $e->getMessage(), 'id' => $id]);
            return response()->json([
                'status' => 500,
                'message' => 'Internal server error',
            ], 500);
        }
    }

    public function markAllRead(): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/notifications/read-all');

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'status' => $response->status(),
                'message' => 'Failed to mark all notifications as read',
            ], $response->status());
        } catch (ConnectionException $e) {
            Log::error('Mark all notifications read failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 500,
                'message' => 'Internal server error',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Mark all notifications read failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 500,
                'message' => 'Internal server error',
            ], 500);
        }
    }
}
