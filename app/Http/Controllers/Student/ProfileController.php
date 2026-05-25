<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\UserAvatar;
use App\Models\UserPreference;
use App\Models\UserActivityStreak;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProfileController extends Controller
{
    public function index(): InertiaResponse
    {
        $user = session('user');

        if (!$user) {
            return Inertia::render('student/profile', [
                'profile' => null,
                'avatar' => null,
                'stats' => $this->emptyStats(),
                'preferences' => $this->defaultPreferences(),
            ]);
        }

        $avatar = UserAvatar::where('user_id', $user['id'])->first();
        $avatarUrls = $avatar ? $avatar->getUrls() : null;

        $preference = UserPreference::firstOrCreate(
            ['user_id' => $user['id']],
            UserPreference::defaultsFor($user['id'])
        );

        $stats = $this->getStats($user['id']);

        UserActivityStreak::recordActivity($user['id']);

        return Inertia::render('student/profile', [
            'profile' => [
                'id' => $user['id'],
                'name' => $user['name'] ?? '',
                'email' => $user['email'] ?? '',
                'nim' => $user['nim'] ?? '',
                'role' => $user['role'] ?? 'student',
            ],
            'avatar' => $avatarUrls,
            'stats' => $stats,
            'preferences' => $preference->toResponseArray(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = session('user');
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . '/api/users/me', $validated);
            if ($response->successful()) {
                $userData = (array) $response->json('data', []);
                $currentUser = (array) session('user', []);
                session(['user' => array_merge($currentUser, $userData)]);
                return response()->json(['message' => 'Profil berhasil diperbarui', 'data' => $userData]);
            }
            return response()->json(['message' => 'Gagal memperbarui profil'], $response->status());
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::warning('Profile: update failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui profil'], 500);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::warning('Profile: update failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui profil'], 500);
        }
    }

    private function getStats(string $userId): array
    {
        $cacheKey = "profile_stats_{$userId}";
        $stats = Cache::remember($cacheKey, 300, fn() => $this->fetchStats($userId));
        $stats['streak'] = UserActivityStreak::calculateStreak($userId);
        return $stats;
    }

    private function fetchStats(string $userId): array
    {
        $stats = $this->emptyStats();

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/courses');
            if ($response->successful()) {
                $courses = $response->json('data', []);
                $stats['active_courses'] = count(array_filter($courses, fn($c) => ($c['status'] ?? '') === 'aktif'));
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::debug('Profile stats: courses failed', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::debug('Profile stats: courses failed', ['error' => $e->getMessage()]);
        }

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/reflections');
            if ($response->successful()) {
                $stats['total_reflections'] = $response->json('meta.total', count($response->json('data', [])));
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::debug('Profile stats: reflections failed', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::debug('Profile stats: reflections failed', ['error' => $e->getMessage()]);
        }

        return $stats;
    }

    private function emptyStats(): array
    {
        return [
            'active_courses' => 0,
            'completed_tasks' => 0,
            'streak' => 0,
            'total_reflections' => 0,
        ];
    }

    private function defaultPreferences(): array
    {
        return [
            'notifications' => [
                'email' => true,
                'push' => true,
                'tasks' => true,
                'chat' => true,
                'groups' => true,
            ],
            'language' => 'id',
            'theme' => 'system',
            'font_size' => 'normal',
        ];
    }
}
