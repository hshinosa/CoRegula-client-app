<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    protected function apiUrl(): string
    {
        return config('services.api.base_url', 'http://localhost:3000');
    }

    protected function apiRequest()
    {
        return Http::withToken(session('jwt'));
    }

    /**
     * List Lecturer's Courses
     */
    public function index(): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses');
            $courses = $response->successful() ? $response->json('data', []) : [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch courses', ['error' => $e->getMessage()]);
            $courses = [];
        }

        return Inertia::render('lecturer/courses/index', [
            'courses' => $courses,
        ]);
    }

    /**
     * Show Create Course Form
     */
    public function create(): Response
    {
        return Inertia::render('lecturer/courses/create');
    }

    /**
     * Store New Course
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/courses', $validated);

            if ($response->successful()) {
                return redirect()
                    ->route('lecturer.courses.index')
                    ->with('success', 'Course created successfully!');
            }

            return back()->withErrors(['code' => $response->json('message', 'Failed to create course')]);
        } catch (\Exception $e) {
            Log::error('Course creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['code' => 'Unable to create course']);
        }
    }

    /**
     * Show Course Details (Lecturer)
     */
    public function show(string $course): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $response->successful() ? $response->json('data') : null;
        } catch (\Exception $e) {
            Log::error('Failed to fetch course', ['error' => $e->getMessage()]);
            $courseData = null;
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('lecturer/courses/show', [
            'course' => $courseData,
        ]);
    }

    /**
     * Upload course knowledge base materials (multi-format & batch)
     */
    public function uploadKnowledgeBase(Request $request, string $course)
    {
        $allowedMimetypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/markdown',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp',
            'application/zip',
            'application/x-zip-compressed',
        ];

        $request->validate([
            'files' => 'nullable|array|min:1|max:50',
            'files.*' => 'file|mimetypes:' . implode(',', $allowedMimetypes) . '|max:51200', // 50MB per file
            'file' => 'nullable|file|mimetypes:' . implode(',', $allowedMimetypes) . '|max:51200',
            'extract_images' => 'nullable|boolean',
            'perform_ocr' => 'nullable|boolean',
        ], [
            'files.min' => 'Pilih minimal satu berkas untuk diunggah.',
        ]);

        $uploadedFiles = collect($request->file('files', []));
        if ($request->file('file')) {
            $uploadedFiles->push($request->file('file'));
        }

        if ($uploadedFiles->isEmpty()) {
            return back()->withErrors(['files' => 'Pilih minimal satu berkas untuk diunggah.']);
        }

        try {
            $pendingRequest = $this->apiRequest();

            foreach ($uploadedFiles as $file) {
                $pendingRequest = $pendingRequest->attach(
                    'files[]',
                    fopen($file->getRealPath(), 'r'),
                    $file->getClientOriginalName()
                );
            }

            $payload = [
                'extract_images' => $request->boolean('extract_images', true) ? 'true' : 'false',
                'perform_ocr' => $request->boolean('perform_ocr', false) ? 'true' : 'false',
            ];

            $response = $pendingRequest
                ->post($this->apiUrl() . "/api/courses/{$course}/knowledge-base/batch", $payload);

            if ($response->successful()) {
                $stats = $response->json('data.stats');
                $message = $stats
                    ? sprintf('Mengunggah %d berkas berhasil, %d ditolak.', $stats['totalUploaded'] ?? 0, $stats['totalRejected'] ?? 0)
                    : 'Berkas berhasil diunggah. Proses akan berlangsung di latar belakang.';

                return back()->with('success', $message);
            }

            $errorMessage = $response->json('error.message')
                ?? $response->json('message')
                ?? 'Upload gagal, silakan coba lagi.';

            return back()->withErrors(['files' => $errorMessage]);
        } catch (\Exception $e) {
            Log::error('Knowledge base upload failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['files' => 'Tidak dapat mengunggah berkas saat ini.']);
        }
    }

    /**
     * List Student's Enrolled Courses
     */
    public function enrolled(): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses/enrolled');
            $courses = $response->successful() ? $response->json('data', []) : [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch enrolled courses', ['error' => $e->getMessage()]);
            $courses = [];
        }

        return Inertia::render('student/courses/index', [
            'courses' => $courses,
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
            Log::error('Course join failed', ['error' => $e->getMessage()]);
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
            Log::error('Failed to fetch course', ['error' => $e->getMessage()]);
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
            'hasGroup' => !is_null($group),
            'hasGoal' => !is_null($goal),
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
            Log::error('Failed to fetch chat spaces data', ['error' => $e->getMessage()]);
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
            Log::error('Failed to fetch chat room data', ['error' => $e->getMessage()]);
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
     * Legacy Chat Page - Redirect to chat spaces
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
            Log::error('Failed to fetch chat data', ['error' => $e->getMessage()]);
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
}
