<?php

namespace App\Http\Controllers;

use App\Models\PromptTemplate;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiChatTemplateController extends Controller
{
    public function index(Request $request)
    {
        $userId = session('user.id');
        $category = $request->input('category');

        $templates = PromptTemplate::forUser($userId)
            ->byCategory($category)
            ->orderBy('is_global', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $templates]);
    }

    public function store(Request $request)
    {
        $userId = session('user.id');

        $personalCount = PromptTemplate::where('user_id', $userId)->count();
        if ($personalCount >= 50) {
            return response()->json([
                'error' => 'Anda telah mencapai batas maksimal 50 template personal.',
            ], 422);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:500',
            'prompt_body' => 'required|string|max:10000',
            'category' => 'nullable|string|max:100',
        ]);

        try {
            $template = PromptTemplate::create([
                ...$validated,
                'user_id' => $userId,
                'is_global' => false,
            ]);

            return response()->json(['data' => $template], 201);
        } catch (ConnectionException $e) {
            Log::error('Failed to create template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal membuat template'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to create template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal membuat template'], 500);
        }
    }

    public function show(PromptTemplate $template)
    {
        $userId = session('user.id');

        if (!$template->is_global && $template->user_id !== $userId) {
            return response()->json(['error' => 'Template tidak ditemukan'], 404);
        }

        return response()->json(['data' => $template]);
    }

    public function update(Request $request, PromptTemplate $template)
    {
        $userId = session('user.id');

        if ($template->user_id !== $userId) {
            return response()->json(['error' => 'Anda tidak memiliki akses untuk mengedit template ini'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:500',
            'prompt_body' => 'required|string|max:10000',
            'category' => 'nullable|string|max:100',
        ]);

        try {
            $template->update($validated);
            return response()->json(['data' => $template->fresh()]);
        } catch (ConnectionException $e) {
            Log::error('Failed to update template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal mengupdate template'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to update template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal mengupdate template'], 500);
        }
    }

    public function destroy(PromptTemplate $template)
    {
        $userId = session('user.id');

        if ($template->user_id !== $userId) {
            return response()->json(['error' => 'Anda tidak memiliki akses untuk menghapus template ini'], 403);
        }

        try {
            $template->delete();
            return response()->json(['message' => 'Template berhasil dihapus']);
        } catch (ConnectionException $e) {
            Log::error('Failed to delete template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus template'], 500);
        } catch (RequestException $e) {
            Log::error('Failed to delete template', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Gagal menghapus template'], 500);
        }
    }

    public function categories()
    {
        $userId = session('user.id');

        $categories = PromptTemplate::forUser($userId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return response()->json(['data' => $categories]);
    }
}
