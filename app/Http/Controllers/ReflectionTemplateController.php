<?php

namespace App\Http\Controllers;

use App\Models\ReflectionTemplate;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReflectionTemplateController extends Controller
{
    public function index(Request $request)
    {
        $userId = session('user.id');
        $category = $request->input('category');

        $templates = ReflectionTemplate::forUser($userId)
            ->byCategory($category)
            ->orderBy('is_global', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $templates]);
    }

    public function store(Request $request)
    {
        $userId = session('user.id');

        $personalCount = ReflectionTemplate::where('user_id', $userId)->count();
        if ($personalCount >= 30) {
            return response()->json([
                'error' => 'Anda telah mencapai batas maksimal 30 template personal.',
            ], 422);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:500',
            'content_template' => 'required|string|max:10000',
            'category' => 'nullable|string|max:100',
        ]);

        try {
            $template = ReflectionTemplate::create([
                ...$validated,
                'user_id' => $userId,
                'is_global' => false,
            ]);

            return response()->json(['data' => $template], 201);
        } catch (ConnectionException $e) {
            Log::error('Failed to create reflection template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal membuat template'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to create reflection template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal membuat template'], 500);
        }
    }

    public function show(ReflectionTemplate $template)
    {
        $userId = session('user.id');

        if (!$template->is_global && $template->user_id !== $userId) {
            return response()->json(['error' => 'Template tidak ditemukan'], 404);
        }

        return response()->json(['data' => $template]);
    }

    public function update(Request $request, ReflectionTemplate $template)
    {
        $userId = session('user.id');

        if ($template->user_id !== $userId) {
            return response()->json(['error' => 'Anda tidak memiliki akses untuk mengedit template ini'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:500',
            'content_template' => 'required|string|max:10000',
            'category' => 'nullable|string|max:100',
        ]);

        try {
            $template->update($validated);
            return response()->json(['data' => $template]);
        } catch (ConnectionException $e) {
            Log::error('Failed to update reflection template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal memperbarui template'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to update reflection template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal memperbarui template'], 500);
        }
    }

    public function destroy(ReflectionTemplate $template)
    {
        $userId = session('user.id');

        if ($template->user_id !== $userId) {
            return response()->json(['error' => 'Anda tidak memiliki akses untuk menghapus template ini'], 403);
        }

        try {
            $template->delete();
            return response()->json(['message' => 'Template berhasil dihapus']);
        } catch (ConnectionException $e) {
            Log::error('Failed to delete reflection template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus template'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to delete reflection template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus template'], 500);
        }
    }
}
