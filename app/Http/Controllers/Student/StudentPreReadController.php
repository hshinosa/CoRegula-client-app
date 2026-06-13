<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\WeekMaterialAccessService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class StudentPreReadController extends Controller
{
    public function __construct(
        private readonly WeekMaterialAccessService $access
    ) {}

    public function show(Request $request, string $course, string $chatSpace): Response|RedirectResponse
    {
        $chat = $this->fetchChatSpace($chatSpace);
        if (! $chat) {
            abort(404, 'Chat space not found');
        }

        $isReview = $request->boolean('review');

        if (! $isReview && $this->shouldSkipPreRead($chat)) {
            return $this->redirectAfterPreRead($course, $chatSpace, $chat);
        }

        if (! $isReview && ! empty($chat['hasPreReadCompleted'])) {
            return $this->redirectAfterPreRead($course, $chatSpace, $chat);
        }

        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
        } catch (ConnectionException|RequestException $e) {
            Log::error('Pre-read: course fetch failed', ['error' => $e->getMessage()]);
            $courseData = null;
        }

        if (! $courseData) {
            abort(404, 'Course not found');
        }

        $weekId = $chat['weekId'] ?? null;
        $materialsPayload = [
            'session_week' => null,
            'primary' => [],
            'earlier' => [],
            'message' => null,
        ];

        if ($weekId) {
            $bundled = $this->access->materialsForSessionWeek($course, $weekId);
            $materialsPayload = [
                'session_week' => $bundled['session_week'] ? [
                    'id' => $bundled['session_week']->id,
                    'week_index' => $bundled['session_week']->week_index,
                    'title' => $bundled['session_week']->title,
                ] : null,
                'primary' => $bundled['primary']->map(fn ($row) => $this->serializeMaterialRow($row))->values()->all(),
                'earlier' => $bundled['earlier']->map(fn ($row) => $this->serializeMaterialRow($row))->values()->all(),
                'message' => null,
            ];
        } else {
            $materialsPayload['message'] = 'Sesi belum terikat minggu kuliah.';
        }

        return Inertia::render('student/pre-read/show', [
            'course' => $courseData,
            'chatSpace' => [
                'id' => $chat['id'],
                'name' => $chat['name'],
                'description' => $chat['description'] ?? null,
                'weekId' => $chat['weekId'] ?? null,
                'weekTitle' => $chat['weekTitle'] ?? null,
                'weekIndex' => $chat['weekIndex'] ?? null,
                'groupId' => $chat['groupId'] ?? null,
            ],
            'materials' => $materialsPayload,
            'isReview' => $isReview,
        ]);
    }

    public function complete(string $course, string $chatSpace): RedirectResponse
    {
        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/groups/chat-spaces/{$chatSpace}/pre-read/complete"
            );

            if (! $response->successful()) {
                return redirect()
                    ->route('student.chat-spaces.pre-read.show', ['course' => $course, 'chatSpace' => $chatSpace])
                    ->withErrors(['pre_read' => $response->json('message', 'Gagal menyelesaikan pre-read')]);
            }
        } catch (ConnectionException|RequestException $e) {
            Log::error('Pre-read complete failed', ['error' => $e->getMessage()]);

            return redirect()
                ->route('student.chat-spaces.pre-read.show', ['course' => $course, 'chatSpace' => $chatSpace])
                ->withErrors(['pre_read' => 'Layanan tidak tersedia. Coba lagi.']);
        }

        $chat = $this->fetchChatSpace($chatSpace);

        return $this->redirectAfterPreRead($course, $chatSpace, $chat ?? []);
    }

    private function shouldSkipPreRead(array $chat): bool
    {
        return ! empty($chat['isClosed']) || empty($chat['weekId']);
    }

    private function redirectAfterPreRead(string $course, string $chatSpace, array $chat): RedirectResponse
    {
        if (! empty($chat['isClosed'])) {
            return redirect()->route('student.courses.chat.room', ['course' => $course, 'chatSpace' => $chatSpace]);
        }

        if (! empty($chat['myGoal'])) {
            return redirect()->route('student.courses.chat.room', ['course' => $course, 'chatSpace' => $chatSpace]);
        }

        return redirect()->route('student.goals.create', ['course' => $course, 'chatSpace' => $chatSpace]);
    }

    private function serializeMaterialRow(array $row): array
    {
        $material = $row['material'];

        return [
            'week_index' => $row['week_index'],
            'week_id' => $row['week_id'],
            'week_title' => $row['week_title'],
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'description' => $material->description,
                'file_name' => $material->file_name,
                'file_type' => $material->file_type,
                'file_size' => $material->file_size,
            ],
        ];
    }

    private function fetchChatSpace(string $chatSpaceId): ?array
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/groups/chat-spaces/{$chatSpaceId}");
            if (! $response->successful()) {
                return null;
            }

            return $response->json('data');
        } catch (ConnectionException|RequestException $e) {
            Log::error('fetchChatSpace failed', ['error' => $e->getMessage()]);

            return null;
        }
    }
}