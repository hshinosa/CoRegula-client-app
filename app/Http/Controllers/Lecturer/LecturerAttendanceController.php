<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LecturerAttendanceController extends Controller
{
    /**
     * List attendance sessions for a course with summary stats.
     */
    public function index(string $course): JsonResponse
    {
        try {
            // Fetch enrolled students from Core API
            $studentsResponse = $this->apiRequest()->get(
                $this->apiUrl() . "/api/courses/{$course}/students"
            );
            $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];
            $totalStudents = count($students);

            $sessions = AttendanceSession::where('course_id', $course)
                ->orderBy('session_date', 'desc')
                ->orderBy('session_number', 'desc')
                ->get();

            // Attach attendance stats per session
            $sessionsData = $sessions->map(function ($session) use ($totalStudents) {
                $records = $session->records()->get();
                $presentCount = $records->where('status', 'present')->count();
                $absentCount = $records->where('status', 'absent')->count();
                $lateCount = $records->where('status', 'late')->count();
                $excusedCount = $records->where('status', 'excused')->count();
                $markedCount = $records->count();

                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'session_date' => $session->session_date->format('Y-m-d'),
                    'session_number' => $session->session_number,
                    'notes' => $session->notes,
                    'total_students' => $totalStudents,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'late_count' => $lateCount,
                    'excused_count' => $excusedCount,
                    'marked_count' => $markedCount,
                    'attendance_rate' => $totalStudents > 0
                        ? round(($presentCount + $lateCount) / $totalStudents * 100, 1)
                        : 0,
                    'created_at' => $session->created_at->toIso8601String(),
                ];
            });

            return response()->json([
                'data' => $sessionsData,
                'meta' => [
                    'total_sessions' => $sessions->count(),
                    'total_students' => $totalStudents,
                ],
            ]);
        } catch (ConnectionException $e) {
            Log::error('LecturerAttendanceController: failed to list sessions', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['data' => [], 'meta' => ['total_sessions' => 0, 'total_students' => 0]]);
        } catch (RequestException $e) {
            Log::error('LecturerAttendanceController: failed to list sessions', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['data' => [], 'meta' => ['total_sessions' => 0, 'total_students' => 0]]);
        }
    }

    /**
     * Create attendance session.
     */
    public function storeSession(Request $request, string $course): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'session_date' => 'required|date',
            'session_number' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $session = AttendanceSession::create([
            'id' => (string) Str::uuid(),
            'course_id' => $course,
            'title' => $validated['title'],
            'session_date' => $validated['session_date'],
            'session_number' => $validated['session_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => session('user.id') ?? null,
        ]);

        return response()->json(['data' => $session], 201);
    }

    /**
     * Get a specific session with all attendance records.
     */
    public function showSession(string $course, string $sessionId): JsonResponse
    {
        $session = AttendanceSession::where('course_id', $course)->findOrFail($sessionId);

        // Fetch students from Core API
        $studentsResponse = $this->apiRequest()->get(
            $this->apiUrl() . "/api/courses/{$course}/students"
        );
        $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];

        $records = $session->records()->get()->keyBy('student_id');

        $studentsData = [];
        foreach ($students as $student) {
            $sid = $student['id'] ?? $student['user_id'] ?? null;
            if (!$sid) continue;

            $record = $records[$sid] ?? null;
            $studentsData[] = [
                'student_id' => $sid,
                'student_name' => $student['name'] ?? $student['user']['name'] ?? 'Unknown',
                'student_email' => $student['email'] ?? $student['user']['email'] ?? '',
                'status' => $record?->status ?? 'absent',
                'notes' => $record?->notes,
                'marked_at' => $record?->marked_at?->toIso8601String(),
            ];
        }

        return response()->json([
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'session_date' => $session->session_date->format('Y-m-d'),
                'session_number' => $session->session_number,
                'notes' => $session->notes,
            ],
            'students' => $studentsData,
        ]);
    }

    /**
     * Update attendance session.
     */
    public function updateSession(Request $request, string $course, string $sessionId): JsonResponse
    {
        $session = AttendanceSession::where('course_id', $course)->findOrFail($sessionId);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'session_date' => 'sometimes|date',
            'session_number' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $session->update($validated);

        return response()->json(['data' => $session]);
    }

    /**
     * Delete attendance session.
     */
    public function destroySession(string $course, string $sessionId): JsonResponse
    {
        $session = AttendanceSession::where('course_id', $course)->findOrFail($sessionId);
        $session->delete();

        return response()->json(['message' => 'Sesi kehadiran berhasil dihapus.']);
    }

    /**
     * Mark attendance for students in a session.
     */
    public function markAttendance(Request $request, string $course, string $sessionId): JsonResponse
    {
        $session = AttendanceSession::where('course_id', $course)->findOrFail($sessionId);

        $validated = $request->validate([
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|string',
            'records.*.status' => 'required|in:present,absent,late,excused',
            'records.*.notes' => 'nullable|string|max:500',
        ]);

        $now = now();
        $markedBy = session('user.id') ?? null;

        foreach ($validated['records'] as $record) {
            AttendanceRecord::updateOrCreate(
                [
                    'session_id' => $session->id,
                    'student_id' => $record['student_id'],
                ],
                [
                    'id' => (string) Str::uuid(),
                    'status' => $record['status'],
                    'notes' => $record['notes'] ?? null,
                    'marked_at' => $now,
                    'marked_by' => $markedBy,
                ]
            );
        }

        return response()->json(['message' => 'Kehadiran berhasil disimpan.']);
    }

    /**
     * Get attendance summary per student for the course.
     */
    public function summary(string $course): JsonResponse
    {
        try {
            // Fetch students from Core API
            $studentsResponse = $this->apiRequest()->get(
                $this->apiUrl() . "/api/courses/{$course}/students"
            );
            $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];

            $totalSessions = AttendanceSession::where('course_id', $course)->count();

            $records = AttendanceRecord::whereIn(
                'session_id',
                AttendanceSession::where('course_id', $course)->pluck('id')
            )->get()->groupBy('student_id');

            $studentSummary = [];
            foreach ($students as $student) {
                $sid = $student['id'] ?? $student['user_id'] ?? null;
                if (!$sid) continue;

                $studentRecords = $records[$sid] ?? collect();
                $presentCount = $studentRecords->where('status', 'present')->count();
                $lateCount = $studentRecords->where('status', 'late')->count();
                $excusedCount = $studentRecords->where('status', 'excused')->count();
                $absentCount = $studentRecords->where('status', 'absent')->count();
                $totalMarked = $studentRecords->count();

                $studentSummary[] = [
                    'student_id' => $sid,
                    'student_name' => $student['name'] ?? $student['user']['name'] ?? 'Unknown',
                    'student_email' => $student['email'] ?? $student['user']['email'] ?? '',
                    'total_sessions' => $totalSessions,
                    'present' => $presentCount,
                    'late' => $lateCount,
                    'excused' => $excusedCount,
                    'absent' => $absentCount,
                    'attendance_percentage' => $totalSessions > 0
                        ? round(($presentCount + $lateCount) / $totalSessions * 100, 1)
                        : 0,
                ];
            }

            // Sort by attendance percentage desc
            usort($studentSummary, fn($a, $b) => $b['attendance_percentage'] - $a['attendance_percentage']);

            return response()->json([
                'data' => $studentSummary,
                'meta' => [
                    'total_sessions' => $totalSessions,
                    'total_students' => count($studentSummary),
                ],
            ]);
        } catch (ConnectionException $e) {
            Log::error('LecturerAttendanceController: failed to get summary', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['data' => [], 'meta' => ['total_sessions' => 0, 'total_students' => 0]]);
        } catch (RequestException $e) {
            Log::error('LecturerAttendanceController: failed to get summary', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['data' => [], 'meta' => ['total_sessions' => 0, 'total_students' => 0]]);
        }
    }

    /**
     * Export attendance to XES-compatible IEEE CSV event log.
     *
     * Format: one row = one event (attendance record).
     * Required XES columns: case_id, activity, timestamp, resource.
     * Additional case attributes: student_name, student_email.
     */
    public function export(string $course): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        try {
            $studentsResponse = $this->apiRequest()->get(
                $this->apiUrl() . "/api/courses/{$course}/students"
            );
            $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];
        } catch (\Throwable $e) {
            $students = [];
        }

        $studentMap = [];
        foreach ($students as $student) {
            $sid = $student['id'] ?? $student['user_id'] ?? null;
            if ($sid) {
                $studentMap[$sid] = [
                    'name' => $student['name'] ?? $student['user']['name'] ?? 'Unknown',
                    'email' => $student['email'] ?? $student['user']['email'] ?? '',
                ];
            }
        }

        $sessions = AttendanceSession::where('course_id', $course)
            ->orderBy('session_date')
            ->orderBy('session_number')
            ->get()
            ->keyBy('id');

        $records = AttendanceRecord::whereIn('session_id', $sessions->keys())
            ->orderBy('marked_at')
            ->get();

        $filename = "kehadiran_{$course}_" . date('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($records, $sessions, $studentMap) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($handle, "\xEF\xBB\xBF");

            // XES-compatible IEEE header comment
            fputcsv($handle, ['# XES-compatible IEEE CSV Event Log']);
            fputcsv($handle, ['# Format: one row = one event (attendance record)']);
            fputcsv($handle, ['# case_id: unique student identifier']);
            fputcsv($handle, ['# activity: attendance status (present, absent, late, excused)']);
            fputcsv($handle, ['# timestamp: ISO 8601 datetime of the session']);
            fputcsv($handle, ['# resource: session title / number']);
            fputcsv($handle, []);

            // Column headers
            fputcsv($handle, [
                'case_id',
                'case:student_name',
                'case:student_email',
                'activity',
                'timestamp',
                'resource',
                'session_title',
                'session_number',
                'notes',
            ]);

            foreach ($records as $record) {
                $session = $sessions[$record->session_id] ?? null;
                $student = $studentMap[$record->student_id] ?? ['name' => 'Unknown', 'email' => ''];

                $timestamp = $record->marked_at
                    ? $record->marked_at->toIso8601String()
                    : ($session ? $session->session_date->format('Y-m-d') . 'T00:00:00+07:00' : '');

                $resource = $session
                    ? "Sesi {$session->session_number}: {$session->title}"
                    : 'Unknown Session';

                fputcsv($handle, [
                    $record->student_id,
                    $student['name'],
                    $student['email'],
                    $record->status,
                    $timestamp,
                    $resource,
                    $session ? $session->title : '',
                    $session ? $session->session_number : '',
                    $record->notes ?? '',
                ]);
            }

            // Summary section
            if ($records->isNotEmpty()) {
                fputcsv($handle, []);
                fputcsv($handle, ['# SUMMARY: Aggregated attendance per student']);
                fputcsv($handle, [
                    'student_id',
                    'student_name',
                    'student_email',
                    'total_sessions',
                    'present',
                    'late',
                    'excused',
                    'absent',
                    'attendance_rate_pct',
                ]);

                $summary = $records->groupBy('student_id')->map(function ($studentRecords) use ($studentMap) {
                    $sid = $studentRecords->first()->student_id;
                    $student = $studentMap[$sid] ?? ['name' => 'Unknown', 'email' => ''];
                    return [
                        'student_id' => $sid,
                        'student_name' => $student['name'],
                        'student_email' => $student['email'],
                        'total_sessions' => $studentRecords->count(),
                        'present' => $studentRecords->where('status', 'present')->count(),
                        'late' => $studentRecords->where('status', 'late')->count(),
                        'excused' => $studentRecords->where('status', 'excused')->count(),
                        'absent' => $studentRecords->where('status', 'absent')->count(),
                        'attendance_rate' => $studentRecords->count() > 0
                            ? round($studentRecords->whereIn('status', ['present', 'late'])->count() / $studentRecords->count() * 100, 1)
                            : 0,
                    ];
                })->sortByDesc('attendance_rate')->values();

                foreach ($summary as $row) {
                    fputcsv($handle, [
                        $row['student_id'],
                        $row['student_name'],
                        $row['student_email'],
                        $row['total_sessions'],
                        $row['present'],
                        $row['late'],
                        $row['excused'],
                        $row['absent'],
                        $row['attendance_rate'],
                    ]);
                }
            }

            fclose($handle);
        }, 200, $headers);
    }
}
