<?php

namespace App\Services;

use App\Models\CourseWeek;
use Illuminate\Support\Facades\DB;

class CourseWeekIndexService
{
    public static function renumberForCourse(string $courseId): void
    {
        $weeks = CourseWeek::where('course_id', $courseId)
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();

        DB::transaction(function () use ($weeks) {
            $index = 1;
            foreach ($weeks as $week) {
                if ((int) $week->week_index !== $index) {
                    $week->update(['week_index' => $index]);
                }
                $index++;
            }
        });
    }

    public static function nextSortOrder(string $courseId): int
    {
        return ((int) CourseWeek::where('course_id', $courseId)->max('sort_order')) + 1;
    }
}
