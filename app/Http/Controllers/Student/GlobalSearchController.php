<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Group;
use App\Models\Reflection;
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
                'groups' => [],
                'reflections' => [],
            ]);
        }

        $user = Auth::user();

        $courses = Course::whereHas('students', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('code', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get(['id', 'name', 'code']);

        $groups = Group::whereHas('members', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->where('name', 'like', "%{$query}%")
            ->with('course:id,name')
            ->limit($limit)
            ->get(['id', 'name', 'course_id']);

        $reflections = Reflection::where('user_id', $user->id)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get(['id', 'title', 'created_at']);

        return response()->json([
            'courses' => $courses,
            'groups' => $groups,
            'reflections' => $reflections,
        ]);
    }
}
