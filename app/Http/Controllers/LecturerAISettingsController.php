<?php

namespace App\Http\Controllers;

use App\Models\AiPreset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LecturerAISettingsController extends Controller
{
    public function index(Request $request)
    {
        $userId = session('user.id');
        $department = session('user.department');

        $presets = AiPreset::visibleTo($userId, $department)
            ->orderBy('is_default', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        $courses = [];
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses', ['owner' => $userId]);
            if ($response->successful()) {
                $courses = $response->json('data', []);
            }
        } catch (\Throwable $e) {
            Log::warning('LecturerAISettingsController: failed to fetch courses', ['error' => $e->getMessage()]);
        }

        return Inertia::render('lecturer/ai-settings', [
            'presets' => $presets,
            'courses' => $courses,
            'department' => $department,
        ]);
    }

    public function preview(Request $request)
    {
        try {
            $validated = $request->validate([
                'prompt' => 'required|string|max:10000',
                'system_prompt' => 'nullable|string|max:5000',
                'course_id' => 'nullable|uuid',
                'provider_name' => 'nullable|string',
                'model' => 'nullable|string',
                'temperature' => 'nullable|numeric|min:0|max:2',
                'max_tokens' => 'nullable|integer|min:1|max:4096',
            ]);

            $coreData = [
                'prompt' => $validated['prompt'],
                'systemPrompt' => $validated['system_prompt'] ?? null,
                'courseId' => $validated['course_id'] ?? null,
                'providerName' => $validated['provider_name'] ?? null,
                'model' => $validated['model'] ?? null,
                'temperature' => $validated['temperature'] ?? 0.7,
                'maxTokens' => $validated['max_tokens'] ?? 1024,
            ];

            $response = $this->apiRequest(timeout: 30)
                ->post($this->apiUrl() . '/api/lecturer/ai/preview', $coreData);

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: preview connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: preview failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Preview failed', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function courseContext(Request $request, string $courseId)
    {
        try {
            $response = $this->apiRequest()
                ->get($this->apiUrl() . "/api/lecturer/ai/courses/{$courseId}/context", $request->query());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: course context connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: course context failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch course context', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $response = $this->apiRequest()
                ->get($this->apiUrl() . '/api/lecturer/ai/history', $request->query());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: history connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: history failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch history', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function archiveHistory(Request $request)
    {
        try {
            $response = $this->apiRequest()
                ->post($this->apiUrl() . '/api/lecturer/ai/history/archive');

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: archive connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: archive failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Archive failed', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function storePreset(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'system_prompt' => 'required|string|max:5000',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:4096',
            'model' => 'nullable|string',
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'uuid',
            'is_shared' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        $preset = AiPreset::create([
            ...$validated,
            'user_id' => session('user.id'),
            'department' => session('user.department'),
        ]);

        if ($preset->is_default) {
            AiPreset::where('user_id', session('user.id'))
                ->where('id', '!=', $preset->id)
                ->update(['is_default' => false]);
        }

        return response()->json(['data' => $preset], 201);
    }

    public function updatePreset(Request $request, string $id)
    {
        $userId = session('user.id');
        $preset = AiPreset::where('user_id', $userId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'system_prompt' => 'sometimes|required|string|max:5000',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:4096',
            'model' => 'nullable|string',
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'uuid',
            'is_shared' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        $preset->update($validated);

        if (($validated['is_default'] ?? false) && $preset->is_default) {
            AiPreset::where('user_id', $userId)
                ->where('id', '!=', $preset->id)
                ->update(['is_default' => false]);
        }

        return response()->json(['data' => $preset]);
    }

    public function destroyPreset(string $id)
    {
        $userId = session('user.id');
        $preset = AiPreset::where('user_id', $userId)->findOrFail($id);
        $preset->delete();

        return response()->json(['meta' => ['message' => 'Preset deleted']]);
    }

    public function importPreset(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'system_prompt' => 'required|string|max:5000',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:4096',
            'model' => 'nullable|string',
        ]);

        $preset = AiPreset::create([
            ...$validated,
            'user_id' => session('user.id'),
            'department' => session('user.department'),
            'is_shared' => false,
        ]);

        return response()->json(['data' => $preset], 201);
    }

    public function exportPreset(string $id)
    {
        $userId = session('user.id');
        $department = session('user.department');

        $preset = AiPreset::visibleTo($userId, $department)->findOrFail($id);

        return response()->json([
            'data' => [
                'name' => $preset->name,
                'description' => $preset->description,
                'system_prompt' => $preset->system_prompt,
                'temperature' => $preset->temperature,
                'max_tokens' => $preset->max_tokens,
                'model' => $preset->model,
            ],
        ]);
    }

    public function listAbTests(Request $request)
    {
        try {
            $response = $this->apiRequest()
                ->get($this->apiUrl() . '/api/lecturer/ai/ab-tests', $request->query());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: ab-tests connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: ab-tests failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch A/B tests', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function storeAbTest(Request $request)
    {
        try {
            $response = $this->apiRequest()
                ->post($this->apiUrl() . '/api/lecturer/ai/ab-tests', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: create ab-test connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: create ab-test failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create A/B test', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function showAbTest(string $id)
    {
        try {
            $response = $this->apiRequest()
                ->get($this->apiUrl() . "/api/lecturer/ai/ab-tests/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: show ab-test connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: show ab-test failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch A/B test', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function updateAbTest(Request $request, string $id)
    {
        try {
            $response = $this->apiRequest()
                ->put($this->apiUrl() . "/api/lecturer/ai/ab-tests/{$id}", $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: update ab-test connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: update ab-test failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update A/B test', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function destroyAbTest(string $id)
    {
        try {
            $response = $this->apiRequest()
                ->delete($this->apiUrl() . "/api/lecturer/ai/ab-tests/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: delete ab-test connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: delete ab-test failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete A/B test', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function abTestStats(string $id)
    {
        try {
            $response = $this->apiRequest()
                ->get($this->apiUrl() . "/api/lecturer/ai/ab-tests/{$id}/stats");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('LecturerAISettingsController: ab-test stats connection failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('LecturerAISettingsController: ab-test stats failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch A/B test stats', 'code' => 'SERVER_ERROR'], 500);
        }
    }
}
