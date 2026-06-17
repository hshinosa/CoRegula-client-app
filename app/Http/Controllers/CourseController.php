<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{

    public function index(): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses');
            $courses = $response->successful() ? $response->json('data', []) : [];
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to fetch courses', ['error' => $e->getMessage()]);
            $courses = [];
        }

        // Compute analytics from courses data
        $analytics = $this->computeAnalytics($courses);

        return Inertia::render('lecturer/courses/index', [
            'courses' => $courses,
            'analytics' => $analytics,
        ]);
    }

    /**
     * Compute analytics aggregation from courses array.
     */
    private function computeAnalytics(array $courses): array
    {
        $totalCourses = count($courses);
        $totalStudents = 0;
        $totalGroups = 0;
        $totalEngagement = 0;
        $statusCounts = ['aktif' => 0, 'selesai' => 0, 'belum_mulai' => 0];
        $semesterCounts = [];

        foreach ($courses as $course) {
            $totalStudents += $course['students_count'] ?? 0;
            $totalGroups += $course['groups_count'] ?? 0;
            $totalEngagement += $course['engagement_count'] ?? 0;
            $status = $course['status'] ?? 'belum_mulai';
            if (isset($statusCounts[$status])) {
                $statusCounts[$status]++;
            }

            $semester = $course['semester'] ?? null;
            $academicYear = $course['academic_year'] ?? null;
            if ($semester && $academicYear) {
                $key = "{$semester} {$academicYear}";
                $semesterCounts[$key] = ($semesterCounts[$key] ?? 0) + 1;
            }
        }

        return [
            'total_courses' => $totalCourses,
            'total_students' => $totalStudents,
            'total_groups' => $totalGroups,
            'avg_students_per_course' => $totalCourses > 0 ? round($totalStudents / $totalCourses, 1) : 0,
            'avg_engagement' => $totalCourses > 0 ? round($totalEngagement / $totalCourses, 1) : 0,
            'status_counts' => $statusCounts,
            'semester_counts' => $semesterCounts,
        ];
    }

    /**
     * Bulk archive courses (max 50 per request).
     */
    public function bulkArchive(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_ids' => 'required|array|min:1|max:50',
            'course_ids.*' => 'string',
        ]);

        $results = ['succeeded' => [], 'failed' => []];

        foreach ($validated['course_ids'] as $courseId) {
            try {
                $response = $this->apiRequest()->put($this->apiUrl() . "/api/courses/{$courseId}", [
                    'status' => 'selesai',
                ]);

                if ($response->successful()) {
                    $results['succeeded'][] = $courseId;
                } else {
                    $results['failed'][] = $courseId;
                }
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to fetch course for edit', ['error' => $e->getMessage()]);
            return redirect()->route('lecturer.courses.index')->with('error', 'Gagal memuat data mata kuliah');
        }
        }

        $totalRequested = count($validated['course_ids']);
        $totalSucceeded = count($results['succeeded']);

        if ($totalSucceeded === $totalRequested) {
            return response()->json([
                'message' => "{$totalSucceeded} kelas berhasil diarsipkan.",
                'data' => $results,
            ]);
        }

        return response()->json([
            'message' => "{$totalSucceeded} dari {$totalRequested} kelas berhasil diarsipkan.",
            'data' => $results,
        ], $totalSucceeded > 0 ? 200 : 500);
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
            'semester' => 'nullable|string|in:Ganjil,Genap',
            'academic_year' => 'nullable|string|regex:/^\d{4}\/\d{4}$/',
            'min_members_per_group' => 'nullable|integer|min:1',
            'max_members_per_group' => 'nullable|integer|min:1|gte:min_members_per_group',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/courses', $validated);

            if ($response->successful()) {
                return redirect()
                    ->route('lecturer.courses.index')
                    ->with('success', 'Course created successfully!');
            }

            return back()->withErrors(['code' => $response->json('message', 'Failed to create course')]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to create course', ['error' => $e->getMessage()]);
            return back()->withErrors(['code' => 'Gagal membuat mata kuliah']);
        }
    }

    public function show(string $course): Response
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $response->successful() ? $response->json('data') : null;
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to fetch course detail', ['error' => $e->getMessage()]);
            return redirect()->route('lecturer.courses.index')->with('error', 'Gagal memuat detail mata kuliah');
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('lecturer/courses/show', [
            'course' => $courseData,
        ]);
    }

    public function update(Request $request, string $course)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'semester' => 'nullable|string|in:Ganjil,Genap',
            'academic_year' => 'nullable|string|regex:/^\d{4}\/\d{4}$/',
            'status' => 'nullable|string|in:aktif,selesai',
            'min_members_per_group' => 'nullable|integer|min:1',
            'max_members_per_group' => 'nullable|integer|min:1|gte:min_members_per_group',
            'ai_guardrail_preset' => 'nullable|string|in:strict,balanced,relaxed',
            'ai_guardrail_allow_rewrite' => 'nullable|boolean',
            'ai_guardrail_allow_flag_only' => 'nullable|boolean',
            'ai_scaffolding_level' => 'nullable|string|in:early,late,auto',
            'ai_scaffolding_enabled' => 'nullable|boolean',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . "/api/courses/{$course}", $validated);

            if ($response->successful()) {
                return back()->with('success', 'Pengaturan ukuran grup berhasil diperbarui!');
            }

            return back()->withErrors([
                'ai_guardrail_preset' => $response->json('message', 'Gagal memperbarui pengaturan AI course'),
            ]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to update course', ['error' => $e->getMessage()]);
            return back()->withErrors(['ai_guardrail_preset' => 'Gagal memperbarui pengaturan AI course']);
        }
    }

    public function knowledgeBaseIndex(string $course): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/knowledge-base");

            if (!$response->successful()) {
                return response()->json(
                    ['data' => [], 'message' => $response->json('message', 'Gagal memuat basis pengetahuan')],
                    $response->status()
                );
            }

            $rows = $response->json('data', []);
            $data = array_map(static function (array $row): array {
                return [
                    'id' => $row['id'] ?? '',
                    'course_material_id' => $row['courseMaterialId'] ?? $row['course_material_id'] ?? null,
                    'file_name' => $row['fileName'] ?? $row['file_name'] ?? '',
                    'file_size' => $row['fileSize'] ?? $row['file_size'] ?? null,
                    'file_type' => $row['mimeType'] ?? $row['file_type'] ?? null,
                    'vector_status' => $row['vectorStatus'] ?? $row['vector_status'] ?? 'pending',
                    'uploaded_at' => $row['uploadedAt'] ?? $row['uploaded_at'] ?? null,
                    'processed_at' => $row['processedAt'] ?? $row['processed_at'] ?? null,
                    'error_message' => $row['errorMessage'] ?? $row['error_message'] ?? null,
                ];
            }, $rows);

            return response()->json(['data' => $data]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to fetch knowledge base', ['error' => $e->getMessage()]);

            return response()->json(['data' => [], 'message' => 'Gagal memuat basis pengetahuan'], 502);
        }
    }

    public function uploadKnowledgeBase(Request $request, string $course)
    {
        $allowedMimetypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword', // .doc (legacy Word)
            'application/vnd.ms-excel', // .xls (legacy Excel)
            'application/vnd.ms-powerpoint', // .ppt (legacy PowerPoint)
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
        } catch (ConnectionException | RequestException $e) {
            Log::error('CourseController: failed to upload knowledge base', ['error' => $e->getMessage()]);
            return back()->withErrors(['files' => 'Gagal mengunggah berkas.']);
        }
    }
}
