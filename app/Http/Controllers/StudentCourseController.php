<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class StudentCourseController extends Controller
{
    /**
     * List Student's Enrolled Courses (Inertia page render)
     */
    public function enrolled(): Response
    {
        return Inertia::render('student/courses/index');
    }

    /**
     * Fetch Student's Enrolled Courses (JSON API for React Query)
     * Supports search (q), filter by status, and pagination
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'q' => 'nullable|string|max:100',
            'filter' => 'nullable|array',
            'filter.status' => 'nullable|string|in:aktif,selesai,belum_mulai',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $validated['q'] ?? null;
        $statusFilter = $validated['filter']['status'] ?? null;
        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 12;

        try {
            // Build query params for external API
            $params = array_filter([
                'q' => $query,
                'status' => $statusFilter,
                'page' => $page,
                'per_page' => $perPage,
            ], fn($v) => $v !== null && $v !== '');

            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/courses/enrolled',
                $params
            );

            if ($response->successful()) {
                $responseData = $response->json();
                $courses = $responseData['data'] ?? [];

                // Apply local filtering if external API doesn't support it
                if ($query && !empty($courses)) {
                    $courses = array_filter($courses, function ($course) use ($query) {
                        $searchLower = mb_strtolower($query);
                        $name = mb_strtolower($course['name'] ?? '');
                        $code = mb_strtolower($course['code'] ?? '');
                        return str_contains($name, $searchLower) || str_contains($code, $searchLower);
                    });
                    $courses = array_values($courses);
                }

                if ($statusFilter && !empty($courses)) {
                    $courses = array_filter($courses, function ($course) use ($statusFilter) {
                        return ($course['status'] ?? '') === $statusFilter;
                    });
                    $courses = array_values($courses);
                }

                // Calculate filter counts from all courses (unfiltered by status)
                $allCourses = $responseData['data'] ?? [];
                $filterCounts = $this->calculateFilterCounts($allCourses, $query);

                // Local pagination
                $total = count($courses);
                $offset = ($page - 1) * $perPage;
                $paginatedCourses = array_slice($courses, $offset, $perPage);

                return response()->json([
                    'data' => $paginatedCourses,
                    'meta' => [
                        'total' => $total,
                        'per_page' => $perPage,
                        'current_page' => $page,
                        'last_page' => max(1, ceil($total / $perPage)),
                    ],
                    'filter_counts' => $filterCounts,
                ]);
            }

            Log::warning('StudentCourseController: external API returned unsuccessful', [
                'status' => $response->status(),
            ]);

            return response()->json([
                'data' => [],
                'meta' => ['total' => 0, 'per_page' => $perPage, 'current_page' => 1, 'last_page' => 1],
                'filter_counts' => ['aktif' => 0, 'selesai' => 0, 'belum_mulai' => 0],
                'error' => 'Layanan kursus sedang tidak tersedia.',
            ], 503);

        } catch (ConnectionException $e) {
            Log::error('StudentCourseController: failed to fetch enrolled courses', ['error' => $e->getMessage()]);

            return response()->json([
                'data' => [],
                'meta' => ['total' => 0, 'per_page' => $perPage, 'current_page' => 1, 'last_page' => 1],
                'filter_counts' => ['aktif' => 0, 'selesai' => 0, 'belum_mulai' => 0],
                'error' => 'Layanan kursus sedang tidak tersedia. Coba lagi nanti.',
            ], 500);
        } catch (RequestException $e) {
            Log::error('StudentCourseController: failed to fetch enrolled courses', ['error' => $e->getMessage()]);

            return response()->json([
                'data' => [],
                'meta' => ['total' => 0, 'per_page' => $perPage, 'current_page' => 1, 'last_page' => 1],
                'filter_counts' => ['aktif' => 0, 'selesai' => 0, 'belum_mulai' => 0],
                'error' => 'Layanan kursus sedang tidak tersedia. Coba lagi nanti.',
            ], 500);
        }
    }

    /**
     * Calculate filter counts for status chips
     */
    private function calculateFilterCounts(array $courses, ?string $query = null): array
    {
        $counts = [
            'aktif' => 0,
            'selesai' => 0,
            'belum_mulai' => 0,
        ];

        foreach ($courses as $course) {
            // If there's a search query, only count courses matching the query
            if ($query) {
                $searchLower = mb_strtolower($query);
                $name = mb_strtolower($course['name'] ?? '');
                $code = mb_strtolower($course['code'] ?? '');
                if (!str_contains($name, $searchLower) && !str_contains($code, $searchLower)) {
                    continue;
                }
            }

            $status = $course['status'] ?? 'belum_mulai';
            if (isset($counts[$status])) {
                $counts[$status]++;
            }
        }

        return $counts;
    }

    /**
     * Join Course via Code
     */
    public function join(Request $request)
    {
        $validated = $request->validate([
            'join_code' => 'required|string|min:4|max:20',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/courses/join', [
                'join_code' => $validated['join_code'],
            ]);

            if ($response->successful()) {
                return redirect()
                    ->route('student.courses.index')
                    ->with('success', 'Successfully joined course!');
            }

            return back()->withErrors(['join_code' => $response->json('message', 'Invalid join code')]);
        } catch (ConnectionException $e) {
            Log::error('StudentCourseController: course join failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['join_code' => 'Unable to join course']);
        } catch (RequestException $e) {
            Log::error('StudentCourseController: course join failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['join_code' => 'Unable to join course']);
        }
    }

    /**
     * Show Course Details (Student) - Unified page with group and session management
     */
    public function showStudent(string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $myGroupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $availableGroupsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/groups");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $myGroup = $myGroupResponse->successful() ? $myGroupResponse->json('data') : null;
            $availableGroups = $availableGroupsResponse->successful() ? $availableGroupsResponse->json('data', []) : [];

            // Fetch chat spaces (sessions) for student's group
            $sessions = [];
            if ($myGroup && isset($myGroup['id'])) {
                $chatSpacesResponse = $this->apiRequest()->get(
                    $this->apiUrl() . "/api/groups/{$myGroup['id']}/chat-spaces"
                );
                $sessions = $chatSpacesResponse->successful() 
                    ? $chatSpacesResponse->json('data', []) 
                    : [];
            }

        } catch (ConnectionException $e) {
            Log::error('StudentCourseController: failed to fetch course', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $myGroup = null;
            $availableGroups = [];
            $sessions = [];
        } catch (RequestException $e) {
            Log::error('StudentCourseController: failed to fetch course', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $myGroup = null;
            $availableGroups = [];
            $sessions = [];
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('student/courses/show', [
            'course' => $courseData,
            'myGroup' => $myGroup,
            'availableGroups' => $availableGroups,
            'sessions' => $sessions,
        ]);
    }

    public function readingRecommendations(Request $request, string $course): JsonResponse
    {
        $validated = $request->validate([
            'topic' => 'required|string|min:1|max:200',
            'limit' => 'nullable|integer|min:1|max:5',
            'source_scope' => 'nullable|string|in:course_knowledge_base',
        ]);

        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/courses/{$course}/reading-recommendations",
                [
                    'topic' => $validated['topic'],
                    'limit' => $validated['limit'] ?? 3,
                    'source_scope' => $validated['source_scope'] ?? 'course_knowledge_base',
                ]
            );

            if ($response->successful()) {
                return response()->json($response->json('data'));
            }

            return response()->json([
                'message' => $response->json('message', 'Gagal mengambil rekomendasi bacaan'),
                'errors' => $response->json('errors', []),
            ], $response->status());
        } catch (ConnectionException | RequestException $e) {
            Log::error('StudentCourseController: reading recommendations failed', ['course' => $course, 'error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Gagal mengambil rekomendasi bacaan',
            ], 500);
        }
    }

    /**
     * Chat Spaces List Page (select or create chat session)
     */
    public function chatSpaces(Request $request, string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;

            $chatSpaceMeta = null;
            if ($group) {
                $queryParams = array_filter([
                    'q' => $request->query('q'),
                    'type' => $request->query('type'),
                    'status' => $request->query('status'),
                    'sort' => $request->query('sort'),
                    'page' => $request->query('page'),
                    'per_page' => $request->query('per_page'),
                ], fn($v) => $v !== null && $v !== '');

                $metaResponse = $this->apiRequest()->get(
                    $this->apiUrl() . "/api/groups/{$group['id']}/chat-spaces",
                    $queryParams
                );

                if ($metaResponse->successful()) {
                    $chatSpaceMeta = $metaResponse->json();
                }
            }
        } catch (ConnectionException $e) {
            Log::error('StudentCourseController: failed to fetch chat spaces data', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceMeta = null;
        } catch (RequestException $e) {
            Log::error('StudentCourseController: failed to fetch chat spaces data', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceMeta = null;
        }

        if (!$courseData || !$group) {
            abort(404, 'Course or group not found');
        }

        return Inertia::render('student/chat-spaces/index', [
            'course' => $courseData,
            'group' => $group,
            'chatSpaceMeta' => $chatSpaceMeta,
        ]);
    }

    /**
     * Chat Room Page (specific chat space)
     */
    public function chatRoom(string $course, string $chatSpace): Response|\Illuminate\Http\RedirectResponse
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $chatSpaceResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/chat-spaces/{$chatSpace}");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
            $chatSpaceData = $chatSpaceResponse->successful() ? $chatSpaceResponse->json('data') : null;
        } catch (ConnectionException $e) {
            Log::error('StudentCourseController: failed to fetch chat room data', ['course' => $course, 'chatSpace' => $chatSpace, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceData = null;
        } catch (RequestException $e) {
            Log::error('StudentCourseController: failed to fetch chat room data', ['course' => $course, 'chatSpace' => $chatSpace, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceData = null;
        }

        if (!$courseData || !$group || !$chatSpaceData) {
            abort(404, 'Course, group, or chat space not found');
        }

        if (
            empty($chatSpaceData['isClosed'])
            && ! empty($chatSpaceData['weekId'])
            && empty($chatSpaceData['hasPreReadCompleted'])
        ) {
            return redirect()->route('student.chat-spaces.pre-read.show', [
                'course' => $course,
                'chatSpace' => $chatSpace,
            ]);
        }

        if (empty($chatSpaceData['isClosed']) && empty($chatSpaceData['myGoal'])) {
            return redirect()->route('student.goals.create', [
                'course' => $course,
                'chatSpace' => $chatSpace,
            ]);
        }

        return Inertia::render('student/chat/room', [
            'course' => $courseData,
            'group' => $group,
            'chatSpace' => $chatSpaceData,
            'socketUrl' => config('services.api.socket_url', 'http://localhost:3000'),
        ]);
    }

    /**
     * Legacy Chat Page
     */
    public function chat(string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $goalResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-goal");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
            $goal = $goalResponse->successful() ? $goalResponse->json('data') : null;
        } catch (ConnectionException $e) {
            Log::error('StudentCourseController: failed to fetch chat data', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $goal = null;
        } catch (RequestException $e) {
            Log::error('StudentCourseController: failed to fetch chat data', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $goal = null;
        }

        if (!$courseData || !$group) {
            abort(404, 'Course or group not found');
        }

        return Inertia::render('student/chat/index', [
            'course' => $courseData,
            'group' => $group,
            'goal' => $goal,
            'hasGoal' => !is_null($goal),
            'socketUrl' => config('services.api.socket_url', 'http://localhost:3000'),
        ]);
    }

    public function closeSession(string $course, string $chatSpace)
    {
        $response = $this->apiRequest()->post($this->apiUrl() . "/api/chat-spaces/{$chatSpace}/close");
        return $this->proxyResponse($response);
    }

    public function submitReflection(\Illuminate\Http\Request $request, string $course, string $chatSpace)
    {
        $validated = $request->validate(['content' => 'required|string|min:50|max:5000']);
        $response = $this->apiRequest()->post($this->apiUrl() . "/api/chat-spaces/{$chatSpace}/reflection", $validated);
        return $this->proxyResponse($response);
    }

    public function chatSpaceSummary(string $course, string $chatSpace)
    {
        $response = $this->apiRequest()->get($this->apiUrl() . "/api/chat-spaces/{$chatSpace}/summary");
        if ($response->status() === 404) {
            return response()->json(['summary' => null], 200);
        }
        return $this->proxyResponse($response);
    }
}
