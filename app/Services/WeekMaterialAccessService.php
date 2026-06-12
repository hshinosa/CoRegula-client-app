<?php

namespace App\Services;

use App\Models\CourseMaterial;
use App\Models\CourseWeek;
use Illuminate\Support\Collection;

class WeekMaterialAccessService
{
    public function sessionWeekForCourse(string $courseId, string $weekId): ?CourseWeek
    {
        return CourseWeek::where('course_id', $courseId)
            ->where('id', $weekId)
            ->first();
    }

    public function maxWeekIndex(string $courseId, string $weekId): ?int
    {
        $week = $this->sessionWeekForCourse($courseId, $weekId);

        return $week?->week_index;
    }

    public function isMaterialAllowedForSession(string $courseId, string $materialId, int $sessionWeekIndex): bool
    {
        $material = CourseMaterial::where('course_id', $courseId)
            ->where('id', $materialId)
            ->with('weeks')
            ->first();

        if (! $material || $material->weeks->isEmpty()) {
            return false;
        }

        $minAssignedWeek = (int) $material->weeks->min('week_index');

        return $minAssignedWeek <= $sessionWeekIndex;
    }

    /**
     * @return array{session_week: CourseWeek|null, primary: Collection, earlier: Collection}
     */
    public function materialsForSessionWeek(string $courseId, string $weekId): array
    {
        $sessionWeek = $this->sessionWeekForCourse($courseId, $weekId);
        if (! $sessionWeek) {
            return [
                'session_week' => null,
                'primary' => collect(),
                'earlier' => collect(),
            ];
        }

        $n = $sessionWeek->week_index;

        $weeks = CourseWeek::where('course_id', $courseId)
            ->where('week_index', '<=', $n)
            ->orderBy('week_index')
            ->with(['materials' => function ($q) {
                $q->orderBy('course_week_materials.sort_order');
            }])
            ->get();

        $primary = collect();
        $earlier = collect();

        foreach ($weeks as $week) {
            $bucket = $week->week_index === $n ? $primary : $earlier;
            foreach ($week->materials as $material) {
                $bucket->push([
                    'week_index' => $week->week_index,
                    'week_id' => $week->id,
                    'week_title' => $week->title,
                    'material' => $material,
                ]);
            }
        }

        return [
            'session_week' => $sessionWeek,
            'primary' => $primary,
            'earlier' => $earlier,
        ];
    }
}