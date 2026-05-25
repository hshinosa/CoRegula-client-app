<?php

namespace App\Http\Controllers;

use App\Models\ReflectionTag;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReflectionTagController extends Controller
{
    public function index(Request $request)
    {
        $userId = session('user.id');

        $tags = ReflectionTag::forUser($userId)
            ->selectRaw('tag, COUNT(*) as count')
            ->groupBy('tag')
            ->orderByDesc('count')
            ->get();

        return response()->json(['data' => $tags]);
    }

    public function store(Request $request)
    {
        $userId = session('user.id');

        $validated = $request->validate([
            'reflection_id' => 'required|string',
            'tags' => 'required|array|min:1|max:10',
            'tags.*' => 'required|string|max:50',
        ]);

        try {
            $reflectionId = $validated['reflection_id'];
            $tags = $validated['tags'];

            ReflectionTag::where('reflection_id', $reflectionId)
                ->where('user_id', $userId)
                ->delete();

            $created = [];
            foreach ($tags as $tag) {
                $tag = strtolower(trim($tag));
                if (empty($tag)) continue;
                $created[] = ReflectionTag::create([
                    'reflection_id' => $reflectionId,
                    'user_id' => $userId,
                    'tag' => $tag,
                ]);
            }

            return response()->json(['data' => $created], 201);
        } catch (ConnectionException $e) {
            Log::error('Failed to save reflection tags', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menyimpan tag'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to save reflection tags', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menyimpan tag'], 500);
        }
    }

    public function destroy(Request $request, string $reflectionId, string $tag)
    {
        $userId = session('user.id');

        try {
            $deleted = ReflectionTag::where('reflection_id', $reflectionId)
                ->where('user_id', $userId)
                ->where('tag', $tag)
                ->delete();

            if (!$deleted) {
                return response()->json(['error' => 'Tag tidak ditemukan'], 404);
            }

            return response()->json(['message' => 'Tag berhasil dihapus']);
        } catch (ConnectionException $e) {
            Log::error('Failed to delete reflection tag', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus tag'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to delete reflection tag', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus tag'], 500);
        }
    }

    public function suggestions(Request $request)
    {
        $userId = session('user.id');
        $query = $request->input('q', '');

        $suggestions = ReflectionTag::forUser($userId)
            ->where('tag', 'like', $query . '%')
            ->selectRaw('tag, COUNT(*) as count')
            ->groupBy('tag')
            ->orderByDesc('count')
            ->limit(10)
            ->pluck('tag');

        return response()->json(['data' => $suggestions]);
    }
}
