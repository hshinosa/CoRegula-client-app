<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserManagementController extends Controller
{

    public function index(Request $request)
    {
        $users = [];
        $pagination = [
            'page' => (int) $request->query('page', 1),
            'limit' => (int) $request->query('limit', 20),
            'total' => 0,
            'totalPages' => 1,
        ];

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/admin/users',
                $request->query()
            );

            if ($response->successful()) {
                $payload = $response->json();
                $users = $payload['data'] ?? [];
                $pagination = $payload['meta'] ?? $pagination;
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed fetching users', ['error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to fetch users', ['error' => $e->getMessage()]);
        }

        $responsePayload = [
            'users' => $users,
            'filters' => $request->query(),
            'pagination' => $pagination,
        ];

        if ($request->expectsJson()) {
            return response()->json(['data' => $responsePayload]);
        }

        return Inertia::render('admin/user-management', $responsePayload);
    }

    public function show($id)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/admin/users/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed fetching user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to fetch user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch user', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . '/api/admin/users',
                $request->all()
            );

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed creating user', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to create user', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create user', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $response = $this->apiRequest()->put(
                $this->apiUrl() . "/api/admin/users/{$id}",
                $request->all()
            );

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed updating user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to update user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update user', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/admin/users/{$id}");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed deleting user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to delete user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete user', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function resetPassword(Request $request, $id)
    {
        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/admin/users/{$id}/reset-password",
                $request->all()
            );

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed resetting password', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to reset password', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to reset password', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/admin/users/{$id}/toggle-status");

            return response()->json($response->json(), $response->status());
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('UserManagementController: connection failed toggling user status', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Service unavailable', 'code' => 'SERVICE_TIMEOUT'], 503);
        } catch (\Throwable $e) {
            Log::error('UserManagementController: failed to toggle user status', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to toggle user status', 'code' => 'SERVER_ERROR'], 500);
        }
    }

    public function exportData(\Illuminate\Http\Request $request)
    {
        $params = $request->only(['limit', 'sortBy', 'sortOrder']);
        $response = $this->apiRequest(30, 10)->get($this->apiUrl() . '/api/admin/users', $params);
        return response()->json($response->json(), $response->status());
    }
}
