<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Map legacy material_modules → course_weeks; link materials via pivot.
     * Orphan materials (module_id null) stay pool-only until lecturer assigns.
     */
    public function up(): void
    {
        if (! Schema::hasTable('material_modules') || ! Schema::hasTable('course_weeks')) {
            return;
        }

        $modules = DB::table('material_modules')->orderBy('course_id')->orderBy('sort_order')->get();
        $weekIndexByCourse = [];

        foreach ($modules as $module) {
            $courseId = $module->course_id;
            $weekIndexByCourse[$courseId] = ($weekIndexByCourse[$courseId] ?? 0) + 1;
            $weekIndex = $weekIndexByCourse[$courseId];

            $weekId = (string) Str::uuid();
            DB::table('course_weeks')->insert([
                'id' => $weekId,
                'course_id' => $courseId,
                'week_index' => $weekIndex,
                'title' => $module->title,
                'sort_order' => $module->sort_order ?? $weekIndex,
                'created_at' => $module->created_at ?? now(),
                'updated_at' => $module->updated_at ?? now(),
            ]);

            $materials = DB::table('course_materials')
                ->where('module_id', $module->id)
                ->orderBy('sort_order')
                ->get();

            foreach ($materials as $i => $material) {
                DB::table('course_week_materials')->insert([
                    'id' => (string) Str::uuid(),
                    'course_week_id' => $weekId,
                    'course_material_id' => $material->id,
                    'sort_order' => $material->sort_order ?? ($i + 1),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('course_week_materials')) {
            DB::table('course_week_materials')->truncate();
        }
        if (Schema::hasTable('course_weeks')) {
            DB::table('course_weeks')->truncate();
        }
    }
};