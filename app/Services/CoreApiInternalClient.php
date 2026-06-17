<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoreApiInternalClient
{
    public function baseUrl(): string
    {
        return config('services.api.base_url', 'http://localhost:3000');
    }

    public function secret(): string
    {
        $raw = config('services.api.internal_secret');
        if ($raw === null) {
            $raw = env('CORE_API_INTERNAL_SECRET', env('AI_ENGINE_SECRET', ''));
        }

        return trim((string) $raw);
    }

    public function request(int $timeout = 15)
    {
        $secret = $this->secret();
        $req = Http::timeout($timeout)->connectTimeout(5);
        if ($secret !== '') {
            $req = $req->withHeaders(['X-Internal-Secret' => $secret]);
        }

        return $req;
    }

    public function isConfigured(): bool
    {
        return $this->secret() !== '';
    }

    public function queueCourseMaterial(array $payload): bool
    {
        if ($this->secret() === '') {
            Log::warning('CORE_API_INTERNAL_SECRET missing; skip KB queue');

            return false;
        }

        try {
            $response = $this->request()->post($this->baseUrl().'/api/internal/knowledge-base/queue-course-material', $payload);

            if ($response->failed()) {
                Log::error('KB queue hook rejected', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'course_material_id' => $payload['course_material_id'] ?? null,
                ]);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('KB queue hook failed', ['error' => $e->getMessage(), 'course_material_id' => $payload['course_material_id'] ?? null]);

            return false;
        }
    }

    public function deleteCourseMaterialKb(string $courseId, string $courseMaterialId): void
    {
        if ($this->secret() === '') {
            return;
        }

        try {
            $this->request()->post($this->baseUrl().'/api/internal/knowledge-base/delete-course-material', [
                'course_id' => $courseId,
                'course_material_id' => $courseMaterialId,
            ]);
        } catch (\Throwable $e) {
            Log::error('KB delete hook failed', ['error' => $e->getMessage()]);
        }
    }

    public function linkCourseMaterial(array $payload): void
    {
        if ($this->secret() === '') {
            Log::warning('CORE_API_INTERNAL_SECRET missing; skip KB link');

            return;
        }

        try {
            $this->request()->post($this->baseUrl().'/api/internal/knowledge-base/link-course-material', $payload);
        } catch (\Throwable $e) {
            Log::error('KB link hook failed', ['error' => $e->getMessage(), 'course_material_id' => $payload['course_material_id'] ?? null]);
        }
    }

    public function unassignCourseMaterial(string $courseId, string $courseMaterialId): void
    {
        if ($this->secret() === '') {
            return;
        }

        try {
            $this->request()->post($this->baseUrl().'/api/internal/knowledge-base/unassign-course-material', [
                'course_id' => $courseId,
                'course_material_id' => $courseMaterialId,
            ]);
        } catch (\Throwable $e) {
            Log::error('KB unassign hook failed', ['error' => $e->getMessage()]);
        }
    }
}