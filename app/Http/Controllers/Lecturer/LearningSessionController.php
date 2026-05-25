<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class LearningSessionController extends Controller
{
    /**
     * List learning sessions for a course.
     */
    public function index(Request $request): Response
    {
        try {
            $params = $request->only(['status', 'search', 'page', 'per_page', 'sort', 'order']);
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/learning-sessions', $params);

            $sessions = $response->successful() ? $response->json('data', []) : [];
            $pagination = $response->successful() ? $response->json('pagination', []) : [];
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to fetch sessions', ['error' => $e->getMessage()]);
            $sessions = [];
            $pagination = [];
        }

        return Inertia::render('lecturer/session-mgmt/index', [
            'sessions' => [
                'sessions' => $sessions,
                'pagination' => $pagination,
            ],
            'filters' => $request->only(['status', 'search', 'page', 'per_page', 'sort', 'order']),
        ]);
    }

    /**
     * Create a new learning session.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'chat_space_id' => 'nullable|string',
            'max_participants' => 'nullable|integer|min:1',
            'rules' => 'nullable|array',
            'settings' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
            'auto_close_timeout_minutes' => 'nullable|integer|min:1',
            'template_id' => 'nullable|string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/learning-sessions', $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to create session', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create session'], 500);
        }
    }

    /**
     * Get a single learning session.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/learning-sessions/{$id}");
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to fetch session', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch session'], 500);
        }
    }

    /**
     * Update a learning session.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'max_participants' => 'nullable|integer|min:1',
            'rules' => 'nullable|array',
            'settings' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'auto_close_timeout_minutes' => 'nullable|integer|min:1',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/learning-sessions/{$id}", $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to update session', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update session'], 500);
        }
    }

    /**
     * Delete a learning session.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/learning-sessions/{$id}");
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to delete session', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete session'], 500);
        }
    }

    /**
     * Schedule a session for a specific time.
     */
    public function schedule(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/learning-sessions/{$id}/schedule", $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to schedule session', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to schedule session'], 500);
        }
    }

    /**
     * Cancel a scheduled session.
     */
    public function cancelSchedule(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/learning-sessions/{$id}/cancel-schedule");
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to cancel schedule', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to cancel schedule'], 500);
        }
    }

    public function bulkClose(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ids' => 'required|array|min:1',
            'session_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/learning-sessions/bulk/close', $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to bulk close sessions', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to close sessions'], 500);
        }
    }

    public function bulkArchive(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ids' => 'required|array|min:1',
            'session_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/learning-sessions/bulk/archive', $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to bulk archive sessions', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to archive sessions'], 500);
        }
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_ids' => 'required|array|min:1',
            'session_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/learning-sessions/bulk/delete', $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to bulk delete sessions', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete sessions'], 500);
        }
    }

    /**
     * Update auto-close timeout for a session.
     */
    public function autoCloseUpdate(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'auto_close_timeout_minutes' => 'required|integer|min:1',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/learning-sessions/{$id}", $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to update auto-close', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update auto-close settings'], 500);
        }
    }

    /**
     * Activate a scheduled session.
     */
    public function activate(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/learning-sessions/{$id}/activate");
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            Log::error('LearningSessionController: failed to activate session', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to activate session'], 500);
        }
    }
}
