<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GroupActivityController extends Controller
{
    public function index(Request $request, string $group)
    {
        $validated = $request->validate([
            'cursor' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:50',
            'type' => 'nullable|string|in:member_joined,member_left,task_submitted,comment_added,document_updated,settings_changed',
        ]);

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . "/api/groups/{$group}/activities",
                $validated
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Activity feed fetch failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memuat aktivitas',
                'data' => [],
            ], 500);
        } catch (RequestException $e) {
            Log::error('Activity feed fetch failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memuat aktivitas',
                'data' => [],
            ], 500);
        }
    }
}
