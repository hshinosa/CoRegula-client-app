<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuditLogController extends Controller
{

    public function index(Request $request)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/admin/audit-logs', $request->query() + ['limit' => $request->query('limit', 50)]);

            $payload = $response->json();

            if (!$response->successful()) {
                return response()->json(['message' => $payload['message'] ?? 'Failed to fetch audit logs', 'code' => 'API_ERROR'], $response->status());
            }

            if ($request->expectsJson() || $request->query('format') === 'json') {
                return response()->json($payload, $response->status());
            }

            return Inertia::render('admin/audit-log', [
                'logs' => $payload['data'] ?? [],
                'meta' => $payload['meta'] ?? [
                    'limit' => (int) $request->query('limit', 50),
                    'offset' => (int) $request->query('offset', 0),
                    'total' => 0,
                    'hasMore' => false,
                ],
                'filters' => [
                    'action' => $request->query('action'),
                    'entityType' => $request->query('entityType'),
                    'userId' => $request->query('userId'),
                    'startDate' => $request->query('startDate'),
                    'endDate' => $request->query('endDate'),
                    'limit' => (int) $request->query('limit', 50),
                    'offset' => (int) $request->query('offset', 0),
                ],
            ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AuditLogController: connection failed fetching audit logs', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('AuditLogController: failed to fetch audit logs', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch audit logs', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function entityHistory(string $entityType, string $entityId)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/admin/audit-logs/entity/{$entityType}/{$entityId}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('AuditLogController: connection failed fetching entity history', ['entityType' => $entityType, 'entityId' => $entityId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('AuditLogController: failed to fetch entity audit history', ['entityType' => $entityType, 'entityId' => $entityId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch entity audit history', 'code' => 'SERVER_ERROR'], 500);
        }
    }
}
