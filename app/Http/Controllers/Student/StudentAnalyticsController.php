<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class StudentAnalyticsController extends Controller
{
    public function index(): Response
    {
        $user = session('user');
        if (!$user) {
            abort(401, 'Unauthorized');
        }

        $userId = $user['id'];
        $analytics = null;

        try {
            $response = $this->apiRequest()->get(
                $this->apiUrl() . '/api/student/analytics'
            );

            if ($response->successful()) {
                $data = $response->json();
                
                $analytics = [
                    'weeksActive' => $data['weeksActive'] ?? 0,
                    'sessionsJoined' => $data['sessionsJoined'] ?? 0,
                    'participationTrend' => $data['participationTrend']['direction'] ?? 'stable',
                    'radarMetrics' => [
                        'consistency' => $data['radarMetrics']['consistency'] ?? 0,
                        'participation' => $data['radarMetrics']['participation'] ?? 0,
                        'reflection' => $data['radarMetrics']['reflection'] ?? 0,
                        'weeklyEngagement' => $data['radarMetrics']['engagement'] ?? 0,
                    ],
                    'recentActivities' => array_map(function ($activity) {
                        return [
                            'id' => $activity['id'],
                            'type' => $this->mapActivityType($activity['type']),
                            'description' => $activity['description'],
                            'timestamp' => $activity['timestamp'],
                        ];
                    }, $data['recentActivities'] ?? []),
                ];
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::error('Failed to fetch student analytics', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::error('Failed to fetch student analytics', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);
        }

        return Inertia::render('student/dashboard/analytics/index', [
            'analytics' => $analytics,
        ]);
    }

    private function mapActivityType(string $type): string
    {
        return match ($type) {
            'message' => 'session_joined',
            'reflection' => 'week_completed',
            'goal' => 'week_opened',
            default => 'session_joined',
        };
    }
}
