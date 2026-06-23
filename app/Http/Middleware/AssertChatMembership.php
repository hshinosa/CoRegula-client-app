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
        $sessionDiscussionId = $this->resolveSessionDiscussionId($request);

        if ($sessionDiscussionId === null) {
            return response()->json([
                'message' => 'session_discussion_id or conversation_id is required',
            ], 422);
        }

        try {
            $encodedSessionDiscussionId = rawurlencode($sessionDiscussionId);

            $response = Http::withToken((string) session('jwt'))
                ->timeout(10)
                ->connectTimeout(5)
                ->get(config('services.api.base_url', 'http://localhost:3000') . "/api/groups/session-discussions/{$encodedSessionDiscussionId}");

            if ($response->status() === 401) {
                Session::forget(['jwt', 'refresh_token', 'user']);

                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($response->status() === 403) {
                Log::warning('Unauthorized chat REST access attempt', [
                    'session_discussion_id' => $sessionDiscussionId,
                    'user_id' => session('user.id'),
                    'path' => $request->path(),
                ]);

                return response()->json(['message' => 'Forbidden'], 403);
            }

            if (! $response->successful()) {
                return response()->json(['message' => 'Sesi diskusi tidak ditemukan'], $response->status());
            }

            $request->attributes->set('session_discussion', $response->json('data'));
        } catch (Throwable $e) {
            Log::error('Chat membership assertion failed', [
                'session_discussion_id' => $sessionDiscussionId,
                'user_id' => session('user.id'),
                'path' => $request->path(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Unable to verify chat membership'], 503);
        }

        return $next($request);
    }

    private function resolveSessionDiscussionId(Request $request): ?string
    {
        $value = $request->route('sessionDiscussion')
            ?? $request->input('session_discussion_id')
            ?? $request->input('sessionDiscussionId')
            ?? $request->input('conversation_id')
            ?? $request->query('session_discussion_id')
            ?? $request->query('sessionDiscussionId')
            ?? $request->query('conversation_id');

        return is_string($value) && $value !== '' ? $value : null;
    }
}
