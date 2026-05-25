<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GroupMemberManagementController extends Controller
{
    public function updateRole(Request $request, string $group, string $member)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:admin,member',
        ]);

        try {
            $response = $this->apiRequest()->patch(
                $this->apiUrl() . "/api/groups/{$group}/members/{$member}",
                $validated
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Member role update failed', [
                'group' => $group,
                'member' => $member,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memperbarui peran anggota',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Member role update failed', [
                'group' => $group,
                'member' => $member,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal memperbarui peran anggota',
            ], 500);
        }
    }

    public function destroy(string $group, string $member)
    {
        try {
            $response = $this->apiRequest()->delete(
                $this->apiUrl() . "/api/groups/{$group}/members/{$member}"
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Member removal failed', [
                'group' => $group,
                'member' => $member,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal menghapus anggota',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Member removal failed', [
                'group' => $group,
                'member' => $member,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal menghapus anggota',
            ], 500);
        }
    }

    public function leave(string $group)
    {
        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/groups/{$group}/leave"
            );

            return $this->proxyResponse($response);
        } catch (ConnectionException $e) {
            Log::error('Leave group failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal keluar dari grup',
            ], 500);
        } catch (RequestException $e) {
            Log::error('Leave group failed', [
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Gagal keluar dari grup',
            ], 500);
        }
    }
}
