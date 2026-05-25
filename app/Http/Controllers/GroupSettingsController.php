<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GroupSettingsController extends Controller
{
    public function show(string $group)
    {
        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . "/api/groups/{$group}/settings"
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Group settings fetch failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memuat pengaturan grup',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Group settings fetch failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memuat pengaturan grup',
            ], 500);
        }
    }

    public function update(Request $request, string $group)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|min:3',
            'description' => 'nullable|string|max:500',
            'access_policy' => 'sometimes|required|string|in:open,invite_only,private',
        ]);

        try {
            $response = $this->apiRequest()->patch(
                $this->apiUrl() . "/api/groups/{$group}/settings",
                $validated
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Group settings update failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memperbarui pengaturan grup',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Group settings update failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memperbarui pengaturan grup',
            ], 500);
        }
    }
}
