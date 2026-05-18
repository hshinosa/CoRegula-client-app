<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class StudentCourseController extends Controller
{
    /**
     * List Student's Enrolled Courses
     */
    public function enrolled(): Response
    {
        $courses = [];
        $serviceError = null;
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses/enrolled');
            if ($response->successful()) {
                $courses = $response->json('data', []);
            } else {
                $serviceError = 'Layanan kursus sedang tidak tersedia. Coba lagi nanti.';
            }
        } catch (\Exception $e) {
            Log::error('StudentCourseController: failed to fetch enrolled courses', ['error' => $e->getMessage()]);
            $serviceError = 'Layanan kursus sedang tidak tersedia. Coba lagi nanti.';
        }

        return Inertia::render('student/courses/index', [
            'courses' => $courses,
            'serviceError' => $serviceError,
        ]);
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
        } catch (\Exception $e) {
            Log::error('StudentCourseController: course join failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['join_code' => 'Unable to join course']);
        }
    }

    /**
     * Show Course Details (Student)
     */
    public function showStudent(string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $goalResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-goal");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
            $goal = $goalResponse->successful() ? $goalResponse->json('data') : null;
        } catch (\Exception $e) {
            Log::error('StudentCourseController: failed to fetch course', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $goal = null;
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('student/courses/show', [
            'course' => $courseData,
            'group' => $group,
            'goal' => $goal,
        ]);
    }

    /**
     * Chat Spaces List Page (select or create chat session)
     */
    public function chatSpaces(string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
        } catch (\Exception $e) {
            Log::error('StudentCourseController: failed to fetch chat spaces data', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
        }

        if (!$courseData || !$group) {
            abort(404, 'Course or group not found');
        }

        return Inertia::render('student/chat-spaces/index', [
            'course' => $courseData,
            'group' => $group,
        ]);
    }

    /**
     * Chat Room Page (specific chat space)
     */
    public function chatRoom(string $course, string $chatSpace): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $chatSpaceResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/chat-spaces/{$chatSpace}");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
            $chatSpaceData = $chatSpaceResponse->successful() ? $chatSpaceResponse->json('data') : null;
        } catch (\Exception $e) {
            Log::error('StudentCourseController: failed to fetch chat room data', ['course' => $course, 'chatSpace' => $chatSpace, 'error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceData = null;
        }

        if (!$courseData || !$group || !$chatSpaceData) {
            abort(404, 'Course, group, or chat space not found');
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
        } catch (\Exception $e) {
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
        return response()->json($response->json(), $response->status());
    }

    public function submitReflection(\Illuminate\Http\Request $request, string $course, string $chatSpace)
    {
        $validated = $request->validate(['content' => 'required|string|min:50|max:5000']);
        $response = $this->apiRequest()->post(
            $this->apiUrl() . "/api/chat-spaces/{$chatSpace}/reflection",
            $validated
        );
        return response()->json($response->json(), $response->status());
    }

    public function chatSpaceSummary(string $course, string $chatSpace)
    {
        $response = $this->apiRequest()->get($this->apiUrl() . "/api/chatspaces/{$chatSpace}/summary");
        if ($response->status() === 404) {
            return response()->json(['summary' => null], 200);
        }
        return response()->json($response->json(), $response->status());
    }
}
