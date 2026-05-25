<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SessionTemplateController extends Controller
{
    public function index(): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/session-templates');
            $templates = $response->successful() ? $response->json('data', []) : [];
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to fetch templates', ['error' => $e->getMessage()]);
            $templates = [];
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to fetch templates', ['error' => $e->getMessage()]);
            $templates = [];
        }

        return Inertia::render('lecturer/session-mgmt/templates', [
            'templates' => $templates,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/session-templates/{$id}");
            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to fetch template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch template'], 500);
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to fetch template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch template'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'configuration' => 'nullable|array',
            'configuration.max_participants' => 'nullable|integer|min:1',
            'configuration.rules' => 'nullable|array',
            'configuration.settings' => 'nullable|array',
            'configuration.auto_close_timeout_minutes' => 'nullable|integer|min:1',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/session-templates', $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to create template', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create template'], 500);
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to create template', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create template'], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'configuration' => 'nullable|array',
            'configuration.max_participants' => 'nullable|integer|min:1',
            'configuration.rules' => 'nullable|array',
            'configuration.settings' => 'nullable|array',
            'configuration.auto_close_timeout_minutes' => 'nullable|integer|min:1',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/session-templates/{$id}", $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to update template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update template'], 500);
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to update template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update template'], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/session-templates/{$id}");
            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to delete template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete template'], 500);
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to delete template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete template'], 500);
        }
    }

    public function apply(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'session_name' => 'required|string|max:255',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/session-templates/{$id}/apply", $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to apply template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to apply template'], 500);
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to apply template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to apply template'], 500);
        }
    }

    public function saveFromSession(Request $request, string $sessionId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/sessions/{$sessionId}/save-template", $validated);
            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('SessionTemplateController: failed to save template from session', ['sessionId' => $sessionId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to save template from session'], 500);
        } catch (RequestException $e) {
            Log::error('SessionTemplateController: failed to save template from session', ['sessionId' => $sessionId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to save template from session'], 500);
        }
    }
}
