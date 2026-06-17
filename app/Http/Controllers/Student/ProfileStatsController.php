<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\UserActivityStreak;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ProfileStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $user = session('user');
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = $user['id'];
        $cacheKey = "profile_stats_{$userId}";

        $stats = Cache::remember($cacheKey, 300, function () use ($userId) {
            return $this->aggregateStats($userId);
        });

        UserActivityStreak::recordActivity($userId);
        $stats['streak'] = UserActivityStreak::calculateStreak($userId);

        return response()->json(['data' => $stats]);
    }

    private function aggregateStats(string $userId): array
    {
        $stats = [
            'active_courses' => 0,
            'completed_tasks' => 0,
            'streak' => 0,
            'total_reflections' => 0,
        ];

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/courses',
                ['student_id' => $userId]
            );
            if ($response->successful()) {
                $courses = $response->json('data', []);
                $stats['active_courses'] = count(array_filter($courses, fn($c) => ($c['status'] ?? '') === 'aktif'));
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::error('Stats: courses fetch failed', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::error('Stats: courses fetch failed', ['error' => $e->getMessage()]);
        }

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/submissions',
                ['student_id' => $userId, 'status' => 'submitted']
            );
            if ($response->successful()) {
                $stats['completed_tasks'] = $response->json('meta.total', 0);
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::error('Stats: submissions fetch failed', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::error('Stats: submissions fetch failed', ['error' => $e->getMessage()]);
        }

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/reflections',
                ['user_id' => $userId]
            );
            if ($response->successful()) {
                $stats['total_reflections'] = $response->json('meta.total', count($response->json('data', [])));
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::error('Stats: reflections fetch failed', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::error('Stats: reflections fetch failed', ['error' => $e->getMessage()]);
        }

        return $stats;
    }

    public function invalidateCache(): void
    {
        $userId = session('user.id');
        if ($userId) {
            Cache::forget("profile_stats_{$userId}");
        }
    }
}
