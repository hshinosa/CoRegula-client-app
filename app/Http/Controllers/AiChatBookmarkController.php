<?php

namespace App\Http\Controllers;

use App\Models\ChatBookmark;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiChatBookmarkController extends Controller
{
    public function index(Request $request)
    {
        $userId = session('user.id');
        $conversationId = $request->input('conversation_id');

        $query = ChatBookmark::forUser($userId);

        if ($conversationId) {
            $query->forConversation($conversationId);
        }

        $bookmarks = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $bookmarks]);
    }

    public function store(Request $request)
    {
        $userId = session('user.id');

        $validated = $request->validate([
            'message_id' => 'required|string',
            'conversation_id' => 'nullable|string',
            'note' => 'nullable|string|max:1000',
        ]);

        try {
            $bookmark = ChatBookmark::create([
                ...$validated,
                'user_id' => $userId,
            ]);

            return response()->json(['data' => $bookmark], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
                return response()->json(['error' => 'Pesan ini sudah dibookmark'], 409);
            }
            throw $e;
        } catch (ConnectionException $e) {
            Log::error('Failed to create bookmark', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menyimpan bookmark'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to create bookmark', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menyimpan bookmark'], 500);
        }
    }

    public function destroy(ChatBookmark $bookmark)
    {
        $userId = session('user.id');

        if ($bookmark->user_id !== $userId) {
            return response()->json(['error' => 'Anda tidak memiliki akses untuk menghapus bookmark ini'], 403);
        }

        try {
            $bookmark->delete();
            return response()->json(['message' => 'Bookmark berhasil dihapus']);
        } catch (ConnectionException $e) {
            Log::error('Failed to delete bookmark', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus bookmark'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to delete bookmark', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus bookmark'], 500);
        }
    }

    public function toggle(Request $request)
    {
        $userId = session('user.id');

        $validated = $request->validate([
            'message_id' => 'required|string',
            'conversation_id' => 'nullable|string',
            'note' => 'nullable|string|max:1000',
        ]);

        try {
            $existing = ChatBookmark::where('user_id', $userId)
                ->where('message_id', $validated['message_id'])
                ->first();

            if ($existing) {
                $existing->delete();
                return response()->json(['data' => null, 'bookmarked' => false]);
            }

            $bookmark = ChatBookmark::create([
                ...$validated,
                'user_id' => $userId,
            ]);

            return response()->json(['data' => $bookmark, 'bookmarked' => true], 201);
        } catch (ConnectionException $e) {
            Log::error('Failed to toggle bookmark', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal mengubah bookmark'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to toggle bookmark', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal mengubah bookmark'], 500);
        }
    }

    public function check(Request $request)
    {
        $userId = session('user.id');
        $messageIds = $request->input('message_ids', []);

        if (empty($messageIds)) {
            return response()->json(['data' => []]);
        }

        $bookmarked = ChatBookmark::where('user_id', $userId)
            ->whereIn('message_id', $messageIds)
            ->pluck('message_id')
            ->toArray();

        return response()->json(['data' => $bookmarked]);
    }
}
