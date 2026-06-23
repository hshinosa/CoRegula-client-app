<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SessionManagementController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            $params = $request->only(['status', 'search', 'page', 'per_page', 'sort', 'order']);
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/sessions', $params);
            $sessions = $response->successful() ? $response->json('data', ['sessions' => [], 'pagination' => []]) : ['sessions' => [], 'pagination' => []];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to fetch sessions - connection failed', ['error' => $e->getMessage()]);
            $sessions = ['sessions' => [], 'pagination' => []];
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to fetch sessions - request failed', ['error' => $e->getMessage()]);
            $sessions = ['sessions' => [], 'pagination' => []];
        }

        return Inertia::render('lecturer/session-mgmt/index', [
            'sessions' => $sessions,
            'filters' => $params,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/sessions/{$id}");
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to fetch session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to fetch session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch session'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'max_participants' => 'nullable|integer|min:1',
            'rules' => 'nullable|array',
            'settings' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
            'auto_close_timeout_minutes' => 'nullable|integer|min:1',
            'template_id' => 'nullable|string',
            'session_discussion_id' => 'nullable|string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/sessions', $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to create session - connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to create session - request failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create session'], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'max_participants' => 'nullable|integer|min:1',
            'rules' => 'nullable|array',
            'settings' => 'nullable|array',
            'auto_close_timeout_minutes' => 'nullable|integer|min:1',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/sessions/{$id}", $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to update session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to update session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update session'], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/sessions/{$id}");
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to delete session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to delete session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete session'], 500);
        }
    }

    public function schedule(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/sessions/{$id}/schedule", $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to pause session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to pause session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to pause session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to pause session'], 500);
        }
    }

    public function cancelSchedule(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/sessions/{$id}/cancel-schedule");
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to archive session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to archive session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to archive session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to archive session'], 500);
        }
    }

    public function activate(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/sessions/{$id}/activate");
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to close session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to close session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to close session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to close session'], 500);
        }
    }

    public function close(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/sessions/{$id}/close");
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to start session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to start session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to start session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to start session'], 500);
        }
    }

    public function archive(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/sessions/{$id}/archive");
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to resume session - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to resume session'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to resume session - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to resume session'], 500);
        }
    }

    public function updateAutoClose(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'auto_close_timeout_minutes' => 'required|integer|min:1',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/sessions/{$id}/auto-close", $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to update auto-close - connection failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update auto-close'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to update auto-close - request failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update auto-close'], 500);
        }
    }

    public function bulkClose(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ids' => 'required|array|min:1|max:50',
            'session_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/sessions/bulk/close', $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to bulk close sessions - connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk close sessions'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to bulk close sessions - request failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk close sessions'], 500);
        }
    }

    public function bulkArchive(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ids' => 'required|array|min:1|max:50',
            'session_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/sessions/bulk/archive', $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to bulk archive sessions - connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk archive sessions'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to bulk archive sessions - request failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk archive sessions'], 500);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ids' => 'required|array|min:1|max:50',
            'session_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/sessions/bulk/delete', $validated);
            return $this->proxyResponse($response);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('SessionManagementController: failed to bulk delete sessions - connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk delete sessions'], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::error('SessionManagementController: failed to bulk delete sessions - request failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk delete sessions'], 500);
        }
    }
}
