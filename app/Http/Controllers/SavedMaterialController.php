<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SavedMaterialController extends Controller
{
    public function index(Request $request)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/saved-materials', [
                'page' => $request->query('page', 1),
                'pageSize' => $request->query('pageSize', 20),
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Failed to fetch saved materials'], $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to fetch saved materials', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch saved materials'], 500);
        }
    }

    public function toggle(Request $request)
    {
        try {
            $validated = $request->validate([
                'courseMaterialId' => 'required|string',
                'note' => 'nullable|string|max:1000',
            ]);

            $response = $this->apiRequest()->post($this->apiUrl() . '/api/saved-materials/toggle', $validated);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Failed to toggle saved material'], $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to toggle saved material', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to toggle saved material'], 500);
        }
    }

    public function check(Request $request)
    {
        try {
            $validated = $request->validate([
                'courseMaterialIds' => 'required|array',
                'courseMaterialIds.*' => 'string',
            ]);

            $response = $this->apiRequest()->post($this->apiUrl() . '/api/saved-materials/check', $validated);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['data' => []]);
        } catch (\Exception $e) {
            Log::error('Failed to check saved materials', ['error' => $e->getMessage()]);
            return response()->json(['data' => []]);
        }
    }

    public function destroy(string $id)
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/saved-materials/{$id}");

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Failed to remove saved material'], $response->status());
        } catch (\Exception $e) {
            Log::error('Failed to remove saved material', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to remove saved material'], 500);
        }
    }
}
