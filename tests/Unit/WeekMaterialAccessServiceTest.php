<?php

namespace Tests\Unit;

use App\Models\CourseMaterial;
use App\Models\CourseWeek;
use App\Models\CourseWeekMaterial;
use App\Services\WeekMaterialAccessService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class WeekMaterialAccessServiceTest extends TestCase
{
    private WeekMaterialAccessService $service;

    private string $courseId = '11111111-1111-1111-1111-111111111111';

    private string $week2Id;

    private string $matW1;

    private string $matW3;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createMinimalSchema();
        $this->service = new WeekMaterialAccessService;
        $this->seedWeekFixtures();
    }

    private function createMinimalSchema(): void
    {
        Schema::dropIfExists('course_week_materials');
        Schema::dropIfExists('course_materials');
        Schema::dropIfExists('course_weeks');

        Schema::create('course_weeks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            $table->unsignedInteger('week_index');
            $table->string('title');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->uuid('uploaded_by')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_week_materials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_week_id');
            $table->uuid('course_material_id');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    private function seedWeekFixtures(): void
    {
        $week1Id = (string) Str::uuid();
        $week2Id = (string) Str::uuid();
        $week3Id = (string) Str::uuid();

        CourseWeek::create([
            'id' => $week1Id,
            'course_id' => $this->courseId,
            'week_index' => 1,
            'title' => 'Minggu 1',
            'sort_order' => 1,
        ]);
        CourseWeek::create([
            'id' => $week2Id,
            'course_id' => $this->courseId,
            'week_index' => 2,
            'title' => 'Minggu 2',
            'sort_order' => 2,
        ]);
        CourseWeek::create([
            'id' => $week3Id,
            'course_id' => $this->courseId,
            'week_index' => 3,
            'title' => 'Minggu 3',
            'sort_order' => 3,
        ]);

        $matW1 = (string) Str::uuid();
        $matW3 = (string) Str::uuid();

        CourseMaterial::create([
            'id' => $matW1,
            'course_id' => $this->courseId,
            'title' => 'Doc W1',
            'file_name' => 'w1.pdf',
            'file_path' => 'materials/w1.pdf',
            'file_size' => 100,
        ]);
        CourseMaterial::create([
            'id' => $matW3,
            'course_id' => $this->courseId,
            'title' => 'Doc W3',
            'file_name' => 'w3.pdf',
            'file_path' => 'materials/w3.pdf',
            'file_size' => 100,
        ]);

        CourseWeekMaterial::create([
            'id' => (string) Str::uuid(),
            'course_week_id' => $week1Id,
            'course_material_id' => $matW1,
            'sort_order' => 1,
        ]);
        CourseWeekMaterial::create([
            'id' => (string) Str::uuid(),
            'course_week_id' => $week3Id,
            'course_material_id' => $matW3,
            'sort_order' => 1,
        ]);

        $this->week2Id = $week2Id;
        $this->matW1 = $matW1;
        $this->matW3 = $matW3;
    }

    public function test_allows_cumulative_materials_through_session_week_n(): void
    {
        $this->assertTrue($this->service->isMaterialAllowedForSession($this->courseId, $this->matW1, 2));
        $this->assertFalse($this->service->isMaterialAllowedForSession($this->courseId, $this->matW3, 2));
    }

    public function test_materials_for_session_splits_primary_and_earlier(): void
    {
        $bundled = $this->service->materialsForSessionWeek($this->courseId, $this->week2Id);

        $this->assertSame(2, $bundled['session_week']->week_index);
        $this->assertCount(0, $bundled['primary']);
        $this->assertCount(1, $bundled['earlier']);
        $this->assertSame(1, $bundled['earlier'][0]['week_index']);
    }
}