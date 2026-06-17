<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AssertChatMembership
{
    public function handle(Request $request, Closure $next): Response
    {
        $chatSpaceId = $this->resolveChatSpaceId($request);

        if ($chatSpaceId === null) {
            return response()->json([
                'message' => 'chat_space_id or conversation_id is required',
            ], 422);
        }

        try {
            $encodedChatSpaceId = rawurlencode($chatSpaceId);

            $response = Http::withToken((string) session('jwt'))
                ->timeout(10)
                ->connectTimeout(5)
                ->get(config('services.api.base_url', 'http://localhost:3000') . "/api/groups/chat-spaces/{$encodedChatSpaceId}");

            if ($response->status() === 401) {
                Session::forget(['jwt', 'refresh_token', 'user']);

                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($response->status() === 403) {
                Log::warning('Unauthorized chat REST access attempt', [
                    'chat_space_id' => $chatSpaceId,
                    'user_id' => session('user.id'),
                    'path' => $request->path(),
                ]);

                return response()->json(['message' => 'Forbidden'], 403);
            }

            if (! $response->successful()) {
                return response()->json(['message' => 'Chat space not found'], $response->status());
            }

            $request->attributes->set('chat_space', $response->json('data'));
        } catch (Throwable $e) {
            Log::error('Chat membership assertion failed', [
                'chat_space_id' => $chatSpaceId,
                'user_id' => session('user.id'),
                'path' => $request->path(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Unable to verify chat membership'], 503);
        }

        return $next($request);
    }

    private function resolveChatSpaceId(Request $request): ?string
    {
        $value = $request->route('chatSpace')
            ?? $request->input('chat_space_id')
            ?? $request->input('chatSpaceId')
            ?? $request->input('conversation_id')
            ?? $request->query('chat_space_id')
            ?? $request->query('chatSpaceId')
            ?? $request->query('conversation_id');

        return is_string($value) && $value !== '' ? $value : null;
    }
}
