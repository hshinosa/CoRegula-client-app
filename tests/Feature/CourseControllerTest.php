<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CourseControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::dropIfExists('user_avatars');
        Schema::create('user_avatars', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->unique();
            $table->string('original_path', 500)->nullable();
            $table->string('thumbnail_path', 500)->nullable();
            $table->string('medium_path', 500)->nullable();
            $table->string('large_path', 500)->nullable();
            $table->string('original_filename', 255)->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->unsignedInteger('file_size')->default(0);
            $table->timestamps();
        });
    }

    private function authenticatedSession(string $role = 'lecturer'): self
    {
        return $this->withSession([
            'jwt' => $this->createFakeJwt(['sub' => 'user-1']),
            'user' => [
                'id' => 'user-1',
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => $role,
            ],
        ]);
    }

    public function test_index_renders_courses_page(): void
    {
        Http::fake([
            'http://localhost:3000/api/courses' => Http::response([
                'data' => [
                    ['id' => 'course-1', 'name' => 'AI Fundamentals', 'code' => 'AI101'],
                ],
            ], 200),
        ]);

        $response = $this->authenticatedSession('lecturer')->get(route('lecturer.courses.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('lecturer/courses/index')
            ->where('courses.0.id', 'course-1')
            ->where('courses.0.name', 'AI Fundamentals')
        );
    }

    public function test_show_renders_course_detail(): void
    {
        Http::fake([
            'http://localhost:3000/api/courses/course-1' => Http::response([
                'data' => ['id' => 'course-1', 'name' => 'AI Fundamentals', 'code' => 'AI101'],
            ], 200),
        ]);

        $response = $this->authenticatedSession('lecturer')->get(route('lecturer.courses.show', 'course-1'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('lecturer/courses/show')
            ->where('course.id', 'course-1')
            ->where('course.code', 'AI101')
        );
    }

    public function test_store_creates_course(): void
    {
        Http::fake([
            'http://localhost:3000/api/courses' => Http::response([
                'data' => ['id' => 'course-1'],
            ], 201),
        ]);

        $response = $this->authenticatedSession('lecturer')->post(route('lecturer.courses.store'), [
            'code' => 'AI101',
            'name' => 'AI Fundamentals',
        ]);

        $response->assertRedirect(route('lecturer.courses.index'));
        $response->assertSessionHas('success', 'Course created successfully!');

        Http::assertSent(function ($request) {
            return $request->url() === 'http://localhost:3000/api/courses'
                && $request->method() === 'POST'
                && $request['code'] === 'AI101'
                && $request['name'] === 'AI Fundamentals'
                && str_starts_with((string) $request->header('Authorization')[0] ?? '', 'Bearer ');
        });
    }

    public function test_join_redirects_student_on_success(): void
    {
        Http::fake([
            'http://localhost:3000/api/courses/join' => Http::response([
                'data' => ['id' => 'course-1'],
            ], 200),
        ]);

        $response = $this->authenticatedSession('student')->post(route('student.courses.join'), [
            'join_code' => 'JOIN1234',
        ]);

        $response->assertRedirect(route('student.courses.index'));
        $response->assertSessionHas('success', 'Successfully joined course!');
    }

    public function test_index_handles_api_error(): void
    {
        Http::fake([
            'http://localhost:3000/api/courses' => Http::response([
                'error' => 'Server error',
            ], 500),
        ]);

        $response = $this->authenticatedSession('lecturer')->get(route('lecturer.courses.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('lecturer/courses/index')
            ->where('courses', [])
        );
    }

    public function test_knowledge_base_index_returns_snake_case_rows(): void
    {
        Http::fake([
            'http://localhost:3000/api/courses/course-1/knowledge-base' => Http::response([
                'data' => [
                    [
                        'id' => 'kb-1',
                        'courseMaterialId' => 'mat-99',
                        'fileName' => 'slide.pdf',
                        'fileSize' => 1024,
                        'mimeType' => 'application/pdf',
                        'vectorStatus' => 'ready',
                        'uploadedAt' => '2026-06-01T00:00:00.000Z',
                        'processedAt' => '2026-06-01T00:01:00.000Z',
                        'errorMessage' => null,
                    ],
                ],
            ], 200),
        ]);

        $response = $this->authenticatedSession('lecturer')->getJson(
            route('lecturer.courses.knowledge-base.index', 'course-1')
        );

        $response->assertOk();
        $response->assertJsonPath('data.0.id', 'kb-1');
        $response->assertJsonPath('data.0.file_name', 'slide.pdf');
        $response->assertJsonPath('data.0.vector_status', 'ready');
        $response->assertJsonPath('data.0.course_material_id', 'mat-99');
    }
}
