<?php

namespace Database\Seeders;

use App\Models\CourseMaterial;
use App\Models\MaterialModule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MaterialsDemoSeeder extends Seeder
{
    private array $courseTopics = [
        'IF201' => ['React SPA Architecture', 'Autentikasi JWT', 'REST API Integration'],
        'IF202' => ['Normalisasi Database', 'Query Optimization', 'Indexing Strategy'],
        'IF203' => ['Sorting Algorithm', 'Graph Traversal', 'Dynamic Programming'],
        'IF204' => ['TCP/IP Layer', 'Routing Protocol', 'Network Security'],
        'IF205' => ['Machine Learning Pipeline', 'Model Evaluation', 'Prompt Engineering'],
        'IF206' => ['Software Requirement', 'Clean Architecture', 'Testing Strategy'],
        'IF207' => ['Process Scheduling', 'Memory Management', 'File System'],
        'IF208' => ['Mobile UI Pattern', 'State Management', 'API Consumption'],
        'IF209' => ['Rendering Pipeline', 'Transformasi Geometri', 'Lighting Model'],
        'IF210' => ['Threat Modeling', 'Access Control', 'Secure Coding'],
        'IF211' => ['Data Preprocessing', 'Clustering K-Means', 'Association Rule Mining'],
        'IF212' => ['Cloud Deployment', 'Docker Container', 'Scalability Pattern'],
    ];

    public function run(): void
    {
        $apiBaseUrl = rtrim(config('services.api.base_url', 'http://localhost:3000'), '/');
        $credentials = [
            ['email' => 'budi.santoso@univ.ac.id', 'password' => 'password123'],
            ['email' => 'siti.rahayu@univ.ac.id', 'password' => 'password123'],
        ];

        CourseMaterial::query()->delete();
        MaterialModule::query()->delete();

        $moduleTotal = 0;
        $materialTotal = 0;
        $seenCourses = [];

        foreach ($credentials as $credential) {
            $loginResponse = Http::post($apiBaseUrl . '/api/auth/login', $credential);
            if (!$loginResponse->successful()) {
                $this->command?->warn('Skipped materials seed login: ' . $credential['email']);
                continue;
            }

            $token = $loginResponse->json('data.accessToken');
            $coursesResponse = Http::withToken($token)->get($apiBaseUrl . '/api/courses/my');
            $courses = $coursesResponse->successful() ? $coursesResponse->json('data', []) : [];

            foreach ($courses as $course) {
                $courseId = $course['id'] ?? null;
                if (!$courseId || isset($seenCourses[$courseId])) {
                    continue;
                }
                $seenCourses[$courseId] = true;

                $courseCode = $course['code'] ?? 'KLS';
                $courseName = $course['name'] ?? 'Kelas';
                $topics = $this->courseTopics[$courseCode] ?? [
                    'Konsep Dasar ' . $courseName,
                    'Studi Kasus ' . $courseName,
                    'Latihan Terarah ' . $courseName,
                ];

                $modules = [
                    ['title' => 'Materi Inti', 'sort_order' => 1, 'topics' => array_slice($topics, 0, 2)],
                    ['title' => 'Studi Kasus & Latihan', 'sort_order' => 2, 'topics' => array_slice($topics, 1, 2)],
                ];

                foreach ($modules as $moduleData) {
                    $module = MaterialModule::create([
                        'id' => (string) Str::uuid(),
                        'course_id' => $courseId,
                        'title' => $moduleData['title'],
                        'sort_order' => $moduleData['sort_order'],
                    ]);
                    $moduleTotal++;

                    foreach ($moduleData['topics'] as $index => $topic) {
                        CourseMaterial::create([
                            'id' => (string) Str::uuid(),
                            'course_id' => $courseId,
                            'module_id' => $module->id,
                            'title' => $topic,
                            'description' => "Materi siap digunakan AI untuk {$courseName}: {$topic}.",
                            'file_name' => Str::slug($courseCode . ' ' . $topic) . '.pdf',
                            'file_path' => 'demo-materials/' . Str::slug($courseCode . ' ' . $topic) . '.pdf',
                            'file_type' => 'application/pdf',
                            'file_size' => 1024 * (350 + ($index + 1) * 125),
                            'uploaded_by' => $course['owner']['id'] ?? null,
                            'view_count' => 12 + ($index * 7),
                            'sort_order' => $index + 1,
                        ]);
                        $materialTotal++;
                    }
                }
            }
        }

        $this->command?->info("Seeded {$moduleTotal} material modules and {$materialTotal} course materials.");
    }
}
