<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AttendanceDemoSeeder extends Seeder
{
    public function run(): void
    {
        $apiBaseUrl = rtrim(config('services.api.base_url', 'http://localhost:3000'), '/');

        $loginResponse = Http::timeout(30)->connectTimeout(5)->post($apiBaseUrl . '/api/auth/login', [
            'email' => 'lecturer@kolabri.edu',
            'password' => 'password123',
        ]);

        if (!$loginResponse->successful()) {
            $this->command?->error('Failed to login to Core API for attendance demo seed.');
            return;
        }

        $token = $loginResponse->json('data.accessToken');
        if (!$token) {
            $this->command?->error('Core API login did not return accessToken.');
            return;
        }

        $coursesResponse = Http::withToken($token)->timeout(30)->connectTimeout(5)->get($apiBaseUrl . '/api/courses/my');
        $courses = $coursesResponse->successful() ? $coursesResponse->json('data', []) : [];

        AttendanceRecord::query()->delete();
        AttendanceSession::query()->delete();

        $sessionTotal = 0;
        $recordTotal = 0;

        foreach ($courses as $course) {
            $courseId = $course['id'] ?? null;
            if (!$courseId) {
                continue;
            }

            $studentsResponse = Http::withToken($token)->timeout(30)->connectTimeout(5)->get($apiBaseUrl . "/api/courses/{$courseId}/students");
            $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];

            if (count($students) === 0) {
                continue;
            }

            for ($sessionNumber = 1; $sessionNumber <= 6; $sessionNumber++) {
                $session = AttendanceSession::create([
                    'id' => (string) Str::uuid(),
                    'course_id' => $courseId,
                    'title' => 'Pertemuan ' . $sessionNumber,
                    'session_date' => now()->subWeeks(6 - $sessionNumber)->toDateString(),
                    'session_number' => $sessionNumber,
                    'notes' => 'Data kehadiran demo untuk ' . ($course['name'] ?? 'kelas'),
                    'created_by' => $course['owner']['id'] ?? null,
                ]);
                $sessionTotal++;

                foreach ($students as $index => $student) {
                    $studentId = $student['id'] ?? $student['user_id'] ?? null;
                    if (!$studentId) {
                        continue;
                    }

                    $status = match (true) {
                        $index % 11 === 0 && $sessionNumber % 3 === 0 => 'absent',
                        $index % 7 === 0 => 'late',
                        $index % 13 === 0 => 'excused',
                        default => 'present',
                    };

                    AttendanceRecord::create([
                        'id' => (string) Str::uuid(),
                        'session_id' => $session->id,
                        'student_id' => $studentId,
                        'status' => $status,
                        'notes' => $status === 'present' ? null : 'Demo ' . $status,
                        'marked_at' => now()->subWeeks(6 - $sessionNumber)->setTime(9, 0),
                        'marked_by' => $course['owner']['id'] ?? null,
                    ]);
                    $recordTotal++;
                }
            }
        }

        $this->command?->info("Seeded {$sessionTotal} attendance sessions and {$recordTotal} records.");
    }
}
