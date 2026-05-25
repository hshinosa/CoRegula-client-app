<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiChatSearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q', '');
        $bookmarked = $request->boolean('bookmarked', false);
        $cursor = $request->input('cursor');
        $limit = min((int) $request->input('limit', 20), 50);

        if (strlen($query) < 2 && !$bookmarked) {
            return response()->json(['data' => [], 'next_cursor' => null]);
        }

        try {
            $params = array_filter([
                'q' => $query,
                'limit' => $limit,
                'cursor' => $cursor,
            ]);

            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/ai-chats/search',
                $params
            );

            if ($response->successful()) {
                $results = $response->json('data', []);

                if ($bookmarked) {
                    $bookmarkedMessageIds = \App\Models\ChatBookmark::where('user_id', session('user.id'))
                        ->pluck('message_id')
                        ->toArray();

                    $results = array_filter($results, function ($chat) use ($bookmarkedMessageIds) {
                        if (empty($chat['messages'])) return false;
                        foreach ($chat['messages'] as $msg) {
                            if (in_array($msg['id'], $bookmarkedMessageIds)) return true;
                        }
                        return false;
                    });
                    $results = array_values($results);
                }

                return response()->json([
                    'data' => $results,
                    'next_cursor' => $response->json('next_cursor'),
                ]);
            }

            return $this->localSearch($query, $bookmarked, $limit);
        } catch (ConnectionException $e) {
            Log::error('AI Chat search failed', ['error' => $e->getMessage()]);
            return $this->localSearch($query, $bookmarked, $limit);
        } catch (RequestException $e) {
            Log::error('AI Chat search failed', ['error' => $e->getMessage()]);
            return $this->localSearch($query, $bookmarked, $limit);
        }
    }

    private function localSearch(string $query, bool $bookmarked, int $limit)
    {
        try {
            $chatsResponse = $this->apiRequest()->get($this->apiUrl() . '/api/ai-chats');

            if (!$chatsResponse->successful()) {
                return response()->json(['data' => [], 'next_cursor' => null]);
            }

            $chats = $chatsResponse->json('data', []);
            $results = [];

            $bookmarkedMessageIds = [];
            if ($bookmarked) {
                $bookmarkedMessageIds = \App\Models\ChatBookmark::where('user_id', session('user.id'))
                    ->pluck('message_id')
                    ->toArray();
            }

            foreach ($chats as $chat) {
                $titleMatch = !empty($query) && stripos($chat['title'] ?? '', $query) !== false;
                $contentMatch = false;
                $matchedSnippet = null;

                if (!empty($chat['messages'])) {
                    foreach ($chat['messages'] as $msg) {
                        if (!empty($query) && stripos($msg['content'] ?? '', $query) !== false) {
                            $contentMatch = true;
                            $matchedSnippet = $this->highlightSnippet($msg['content'], $query);
                            break;
                        }
                    }
                }

                if ($bookmarked && !empty($bookmarkedMessageIds)) {
                    $hasBookmark = false;
                    if (!empty($chat['messages'])) {
                        foreach ($chat['messages'] as $msg) {
                            if (in_array($msg['id'], $bookmarkedMessageIds)) {
                                $hasBookmark = true;
                                break;
                            }
                        }
                    }
                    if (!$hasBookmark) continue;
                }

                if ($titleMatch || $contentMatch || ($bookmarked && !empty($bookmarkedMessageIds))) {
                    $results[] = [
                        'id' => $chat['id'],
                        'title' => $chat['title'] ?? 'Chat Baru',
                        'created_at' => $chat['created_at'] ?? $chat['createdAt'] ?? null,
                        'updated_at' => $chat['updated_at'] ?? $chat['updatedAt'] ?? null,
                        'snippet' => $matchedSnippet,
                        'match_type' => $titleMatch ? 'title' : ($contentMatch ? 'content' : 'bookmark'),
                    ];
                }

                if (count($results) >= $limit) break;
            }

            usort($results, fn($a, $b) => strcmp($b['updated_at'] ?? '', $a['updated_at'] ?? ''));

            return response()->json(['data' => $results, 'next_cursor' => null]);
        } catch (ConnectionException $e) {
            Log::error('Local search failed', ['error' => $e->getMessage()]);
            return response()->json(['data' => [], 'next_cursor' => null]);
        } catch (RequestException $e) {
            Log::error('Local search failed', ['error' => $e->getMessage()]);
            return response()->json(['data' => [], 'next_cursor' => null]);
        }
    }

    private function highlightSnippet(string $content, string $query, int $contextLength = 80): string
    {
        $pos = stripos($content, $query);
        if ($pos === false) return mb_substr($content, 0, $contextLength * 2) . '...';

        $start = max(0, $pos - $contextLength);
        $end = min(mb_strlen($content), $pos + mb_strlen($query) + $contextLength);

        $snippet = '';
        if ($start > 0) $snippet .= '...';
        $snippet .= mb_substr($content, $start, $end - $start);
        if ($end < mb_strlen($content)) $snippet .= '...';

        return $snippet;
    }
}
