<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class MessageSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|string',
            'q' => 'required|string|min:2|max:100',
            'cursor' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $conversationId = $validated['conversation_id'];
        $query = $validated['q'];
        $limit = $validated['limit'] ?? 20;
        $cursor = $validated['cursor'] ?? null;

        $sanitizedQuery = preg_replace('/[+\-\>\<\(\)\~\*"\@]/', ' ', $query);
        $sanitizedQuery = preg_replace('/\s+/', ' ', trim((string) $sanitizedQuery));

        if ($sanitizedQuery !== '') {
            try {
                $messages = $this->baseQuery($conversationId, $cursor)
                    ->whereRaw(
                        'MATCH(content) AGAINST(? IN BOOLEAN MODE)',
                        [$sanitizedQuery . '*']
                    )
                    ->orderByDesc('created_at')
                    ->limit($limit + 1)
                    ->get();
            } catch (QueryException $e) {
                report($e);
                $messages = $this->fallbackSearch($conversationId, $query, $cursor, $limit);
            }
        } else {
            $messages = $this->fallbackSearch($conversationId, $query, $cursor, $limit);
        }

        $hasMore = $messages->count() > $limit;
        if ($hasMore) {
            $messages = $messages->take($limit);
        }

        $nextCursor = $hasMore ? $messages->last()?->id : null;

        $highlighted = $messages->map(function ($msg) use ($query) {
            $content = $msg->content;
            $highlightedContent = preg_replace(
                '/(' . preg_quote($query, '/') . ')/i',
                '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>',
                $content
            );

            return [
                'id' => $msg->message_id,
                'content' => $content,
                'highlighted_content' => $highlightedContent,
                'sender_name' => $msg->sender_name ?? 'Unknown',
                'created_at' => $msg->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $highlighted,
            'pagination' => [
                'has_more' => $hasMore,
                'next_cursor' => $nextCursor,
            ],
        ]);
    }

    private function baseQuery(string $conversationId, ?string $cursor)
    {
        $query = ChatMessage::where('conversation_id', $conversationId)
            ->where('is_deleted', false);

        if ($cursor !== null) {
            $query->where('id', '<', $cursor);
        }

        return $query;
    }

    private function fallbackSearch(string $conversationId, string $query, ?string $cursor, int $limit)
    {
        return $this->baseQuery($conversationId, $cursor)
            ->where('content', 'LIKE', '%' . $query . '%')
            ->orderByDesc('created_at')
            ->limit($limit + 1)
            ->get();
    }
}
