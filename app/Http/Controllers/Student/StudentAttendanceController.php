<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class StudentAttendanceController extends Controller
{
    /**
     * Show student's attendance page for a course.
     */
    public function index(string $course): Response
    {
        $user = session('user');
        $studentId = $user['id'] ?? null;

        if (!$studentId) {
            abort(403, 'Unauthorized');
        }

        try {
            // Get course data
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;

            if (!$courseData) {
                abort(404, 'Course not found');
            }

            // Get student's group
            $myGroupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $myGroup = $myGroupResponse->successful() ? $myGroupResponse->json('data') : null;

            if (!$myGroup) {
                // Student not in a group yet
                return Inertia::render('student/courses/attendance', [
                    'course' => $courseData,
                    'myGroup' => null,
                    'sessions' => [],
                    'openSessions' => [],
                    'summary' => [
                        'present' => 0,
                        'absent' => 0,
                        'excused' => 0,
                        'total' => 0,
                        'percentage' => 0,
                    ],
                ]);
            }

            $groupId = $myGroup['id'];

            // Query attendance sessions for this course and group
            $sessions = AttendanceSession::where('course_id', $course)
                ->where('group_id', $groupId)
                ->with(['records' => function ($query) use ($studentId) {
                    $query->where('student_id', $studentId);
                }])
                ->orderBy('session_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Fetch open (running) sessions from core-api
            $openSessionsResponse = $this->apiRequest()->get(
                $this->apiUrl() . "/api/groups/{$groupId}/session-discussions"
            );
            $allSessionDiscussions = $openSessionsResponse->successful() 
                ? $openSessionsResponse->json('data', []) 
                : [];

            // Filter only open sessions (not closed)
            $openSessions = array_filter($allSessionDiscussions, function ($session) {
                return empty($session['closedAt']);
            });

            // Transform sessions for frontend
            $sessionsData = $sessions->map(function ($session) use ($studentId) {
                $record = $session->records->first();
                
                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'session_date' => $session->session_date?->format('Y-m-d'),
                    'session_number' => $session->session_number,
                    'week_id' => $session->week_id,
                    'auto_generated' => $session->auto_generated,
                    'attendance_method' => $session->attendance_method,
                    'notes' => $session->notes,
                    'status' => $record?->status ?? 'pending',
                    'message_count' => 0, // Will be populated from notes if stored
                    'hot_count' => 0,     // Will be populated from notes if stored
                    'marked_at' => $record?->marked_at?->toIso8601String(),
                    'created_at' => $session->created_at->toIso8601String(),
                ];
            });

            // Calculate summary
            $records = AttendanceRecord::whereIn('session_id', $sessions->pluck('id'))
                ->where('student_id', $studentId)
                ->get();

            $presentCount = $records->where('status', 'present')->count();
            $absentCount = $records->where('status', 'absent')->count();
            $excusedCount = $records->where('status', 'excused')->count();
            $total = $records->whereIn('status', ['present', 'absent', 'excused'])->count();

            $gradedTotal = $presentCount + $absentCount;

            $summary = [
                'present' => $presentCount,
                'absent' => $absentCount,
                'excused' => $excusedCount,
                'total' => $total,
                'percentage' => $gradedTotal > 0
                    ? round(($presentCount / $gradedTotal) * 100, 1)
                    : 0,
            ];

            return Inertia::render('student/courses/attendance', [
                'course' => $courseData,
                'myGroup' => $myGroup,
                'sessions' => $sessionsData->values(),
                'openSessions' => array_values($openSessions),
                'summary' => $summary,
            ]);

        } catch (ConnectionException $e) {
            Log::error('StudentAttendanceController: failed to fetch attendance', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Failed to fetch attendance data');
        } catch (RequestException $e) {
            Log::error('StudentAttendanceController: failed to fetch attendance', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Failed to fetch attendance data');
        }
    }

    /**
     * Get attendance summary for a student in a course (JSON).
     */
    public function summary(string $course): JsonResponse
    {
        $user = session('user');
        $studentId = $user['id'] ?? null;

        if (!$studentId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            // Get student's group
            $myGroupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $myGroup = $myGroupResponse->successful() ? $myGroupResponse->json('data') : null;

            if (!$myGroup) {
                return response()->json([
                    'data' => [
                        'present' => 0,
                        'absent' => 0,
                        'excused' => 0,
                        'total' => 0,
                        'percentage' => 0,
                    ],
                ]);
            }

            $groupId = $myGroup['id'];

            // Query attendance sessions for this course and group
            $sessions = AttendanceSession::where('course_id', $course)
                ->where('group_id', $groupId)
                ->pluck('id');

            $records = AttendanceRecord::whereIn('session_id', $sessions)
                ->where('student_id', $studentId)
                ->get();

            $presentCount = $records->where('status', 'present')->count();
            $absentCount = $records->where('status', 'absent')->count();
            $excusedCount = $records->where('status', 'excused')->count();
            $total = $records->whereIn('status', ['present', 'absent', 'excused'])->count();

            $gradedTotal = $presentCount + $absentCount;

            return response()->json([
                'data' => [
                    'present' => $presentCount,
                    'absent' => $absentCount,
                    'excused' => $excusedCount,
                    'total' => $total,
                    'percentage' => $gradedTotal > 0
                        ? round(($presentCount / $gradedTotal) * 100, 1)
                        : 0,
                ],
            ]);

        } catch (ConnectionException $e) {
            Log::error('StudentAttendanceController: failed to fetch summary', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to fetch summary'], 500);
        } catch (RequestException $e) {
            Log::error('StudentAttendanceController: failed to fetch summary', [
                'course' => $course,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to fetch summary'], 500);
        }
    }
}
