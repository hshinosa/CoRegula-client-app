<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MasterDataController extends Controller
{

    public function index(Request $request)
    {
        $tab = $request->query('tab', 'active');
        $defaultPagination = [
            'page' => (int) $request->query('page', 1),
            'limit' => (int) $request->query('limit', 10),
            'total' => 0,
            'totalPages' => 1,
        ];

        [$courses, $pagination] = $this->fetchCourses($request, $tab, $defaultPagination);
        $lecturers = $this->fetchLecturers();

        $responsePayload = [
            'courses' => $courses,
            'pagination' => $pagination,
            'filters' => [
                'search' => $request->query('search'),
                'ownerId' => $request->query('ownerId'),
            ],
            'tab' => $tab,
            'lecturers' => $lecturers,
        ];

        if ($request->expectsJson()) {
            return response()->json(['data' => $responsePayload]);
        }

        return Inertia::render('admin/master-data', $responsePayload);
    }

    public function templatesPage()
    {
        $templates = $this->fetchTemplates();
        $lecturers = $this->fetchLecturers();

        return Inertia::render('admin/templates', [
            'templates' => $templates,
            'lecturers' => $lecturers,
        ]);
    }

    public function show($id)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/admin/courses/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed fetching course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to fetch course details', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch course details', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/admin/courses', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed creating course', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to create course', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/admin/courses/{$id}", $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed updating course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to update course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/admin/courses/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed deleting course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to delete course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function clone(Request $request, $id)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/admin/courses/{$id}/clone", $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed cloning course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to clone course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to clone course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function listTemplates()
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/admin/course-templates');

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed listing templates', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to fetch templates', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch templates', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function showTemplate($id)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/admin/course-templates/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed fetching template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to fetch template details', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch template details', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function storeTemplate(Request $request)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/admin/course-templates', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed creating template', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to create template', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create template', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function destroyTemplate($id)
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/admin/course-templates/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed deleting template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to delete template', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete template', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function createFromTemplate(Request $request, $templateId)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/admin/courses/from-template/{$templateId}", $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed creating from template', ['templateId' => $templateId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to create course from template', ['templateId' => $templateId, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create course from template', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function archive($id)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/admin/courses/{$id}/archive");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed archiving course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to archive course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to archive course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function restore($id)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/admin/courses/{$id}/restore");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed restoring course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to restore course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to restore course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function permanentDelete($id)
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/admin/courses/{$id}/permanent");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed permanently deleting course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to permanently delete course', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to permanently delete course', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function bulkActivate(Request $request)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/admin/courses/bulk-activate', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed bulk activating courses', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to bulk activate courses', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk activate courses', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function bulkDeactivate(Request $request)
    {
        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/admin/courses/bulk-deactivate', $request->all());

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed bulk deactivating courses', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to bulk deactivate courses', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to bulk deactivate courses', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function bulkImport(Request $request)
    {
        try {
            if (!$request->hasFile('file')) {
                return response()->json(['message' => 'CSV file is required', 'code' => 'VALIDATION_ERROR'], 422);
            }

            $file = $request->file('file');
            $response = $this->apiRequest()
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post($this->apiUrl() . '/api/admin/courses/bulk-import');

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MasterDataController: connection failed bulk importing courses', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('MasterDataController: failed to import courses from CSV', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to import courses from CSV', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    private function fetchCourses(Request $request, string $tab, array $defaultPagination): array
    {
        $courses = [];
        $pagination = $defaultPagination;

        try {
            $endpoint = $tab === 'archived' ? '/api/admin/courses/archived' : '/api/admin/courses';
            $response = $this->apiRequest()->get($this->apiUrl() . $endpoint, $request->query());

            if ($response->successful()) {
                $payload = $response->json();
                $data = $payload['data'] ?? [];
                $courses = $data['courses'] ?? $data;
                $pagination = $data['pagination'] ?? $payload['pagination'] ?? $defaultPagination;
            }
        } catch (\Throwable $e) {
            Log::warning('MasterDataController: failed to fetch courses', ['error' => $e->getMessage()]);
        }

        return [$courses, $pagination];
    }

    private function fetchLecturers(): array
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/admin/users', ['role' => 'lecturer', 'limit' => 100]);

            if ($response->successful()) {
                $payload = $response->json();
                return $payload['data']['users'] ?? $payload['data'] ?? [];
            }
        } catch (\Throwable $e) {
            Log::warning('MasterDataController: failed to fetch lecturers', ['error' => $e->getMessage()]);
        }

        return [];
    }

    private function fetchTemplates(): array
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/admin/course-templates');

            if ($response->successful()) {
                return $response->json('data') ?? [];
            }
        } catch (\Throwable $e) {
            Log::warning('MasterDataController: failed to fetch templates', ['error' => $e->getMessage()]);
        }

        return [];
    }

    public function exportData(\Illuminate\Http\Request $request)
    {
        $params = $request->only(['limit', 'sortBy', 'sortOrder']);
        $response = $this->apiRequest(30, 10)->get($this->apiUrl() . '/api/admin/courses', $params);
        return $this->proxyResponse($response);
    }
}
