<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{

    public function index(): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses');
            $courses = $response->successful() ? $response->json('data', []) : [];
        } catch (\Exception $e) {
            Log::error('CourseController: failed to fetch courses', ['error' => $e->getMessage()]);
            $courses = [];
        }

        return Inertia::render('lecturer/courses/index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('lecturer/courses/create');
    }

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
            Log::error('CourseController: course creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['code' => 'Unable to create course']);
        }
    }

    public function show(string $course): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $response->successful() ? $response->json('data') : null;
        } catch (\Exception $e) {
            Log::error('CourseController: failed to fetch course', ['course' => $course, 'error' => $e->getMessage()]);
            $courseData = null;
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('lecturer/courses/show', [
            'course' => $courseData,
        ]);
    }

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
            'files.*' => 'file|mimetypes:' . implode(',', $allowedMimetypes) . '|max:51200',
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

            return back()->withErrors(['files' => $response->json('message', 'Gagal mengunggah berkas.')]);
        } catch (\Exception $e) {
            Log::error('CourseController: knowledge base upload failed', ['course' => $course, 'error' => $e->getMessage()]);
            return back()->withErrors(['files' => 'Tidak dapat mengunggah berkas saat ini.']);
        }
    }
}
