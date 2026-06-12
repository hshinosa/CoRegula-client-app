<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseWeek;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class StudentCourseWeeksController extends Controller
{
    /**
     * List syllabus weeks for enrolled students (picker when creating a session).
     */
    public function index(string $course): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            if (! $response->successful()) {
                return response()->json(['message' => 'Grup tidak ditemukan.'], 404);
            }
        } catch (ConnectionException | RequestException $e) {
            Log::error('StudentCourseWeeksController: my-group failed', ['course' => $course, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Tidak dapat memverifikasi keanggotaan grup.'], 503);
        }

        $weeks = CourseWeek::where('course_id', $course)
            ->orderBy('week_index')
            ->get(['id', 'week_index', 'title', 'sort_order']);

        return response()->json(['weeks' => $weeks]);
    }
}