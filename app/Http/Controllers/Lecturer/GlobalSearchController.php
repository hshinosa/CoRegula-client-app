<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('search', '');
        $limit = min((int) $request->input('limit', 5), 10);

        if (strlen(trim($query)) < 2) {
            return response()->json([
                'courses' => [],
                'students' => [],
                'sessions' => [],
            ]);
        }

        $user = Auth::user();

        $courses = Course::where('lecturer_id', $user->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get(['id', 'name', 'code']);

        $students = User::where('role', 'student')
            ->whereHas('enrolledCourses', function ($q) use ($user) {
                $q->where('lecturer_id', $user->id);
            })
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get(['id', 'name', 'email']);

        $sessions = AttendanceSession::whereHas('course', function ($q) use ($user) {
            $q->where('lecturer_id', $user->id);
        })
            ->where('title', 'like', "%{$query}%")
            ->with('course:id,name')
            ->limit($limit)
            ->get(['id', 'title', 'course_id', 'session_date']);

        return response()->json([
            'courses' => $courses,
            'students' => $students,
            'sessions' => $sessions,
        ]);
    }
}
