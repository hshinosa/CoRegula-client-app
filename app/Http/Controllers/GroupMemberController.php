<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GroupMemberController extends Controller
{
    public function search(Request $request, string $group)
    {
        $validated = $request->validate([
            'q' => 'nullable|string|max:100',
            'role' => 'nullable|string|in:owner,admin,member',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . "/api/groups/{$group}/members/search",
                $validated
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Member search failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal mencari anggota',
                'data' => [],
            ], 500);
        } catch (RequestException $e) {
            Log::error('Member search failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal mencari anggota',
                'data' => [],
            ], 500);
        }
    }
}
