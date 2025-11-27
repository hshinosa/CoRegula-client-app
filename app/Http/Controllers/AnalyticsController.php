<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    protected function apiUrl(): string
    {
        return config('services.api.base_url', 'http://localhost:3000');
    }

    protected function apiRequest()
    {
        return Http::withToken(session('jwt'));
    }

    /**
     * Course Analytics Overview
     * Shows all groups in a course with quality metrics
     */
    public function courseIndex(string $course): Response
    {
        try {
            // Get course data
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;

            if (!$courseData) {
                abort(404, 'Course not found');
            }

            // Get analytics for all groups in the course
            $analyticsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/analytics/course/{$course}");
            $analyticsData = $analyticsResponse->successful() ? $analyticsResponse->json() : null;
            
            // Extract summary and groups from response
            $analytics = null;
            if ($analyticsData && $analyticsData['success'] ?? false) {
                $analytics = [
                    'summary' => $analyticsData['summary'] ?? null,
                    'groups' => $analyticsData['groups'] ?? [],
                ];
            }

        } catch (\Exception $e) {
            Log::error('Failed to fetch course analytics', ['error' => $e->getMessage()]);
            $courseData = null;
            $analytics = null;
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('lecturer/analytics/index', [
            'course' => $courseData,
            'analytics' => $analytics ?? [
                'summary' => [
                    'totalGroups' => 0,
                    'averageQualityScore' => null,
                    'totalMessages' => 0,
                    'groupsNeedingAttention' => 0,
                ],
                'groups' => [],
            ],
            'socketUrl' => config('services.api.socket_url', 'http://localhost:3000'),
        ]);
    }

    /**
     * Group Analytics Detail
     * Shows detailed analytics for a specific group
     */
    public function groupShow(string $course, string $group): Response
    {
        try {
            // Get course data
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;

            // Get group data
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/{$group}");
            $groupData = $groupResponse->successful() ? $groupResponse->json('data') : null;

            // Get detailed analytics for this group from Core-API
            $analyticsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/analytics/group/{$group}");
            $analyticsData = $analyticsResponse->successful() ? $analyticsResponse->json() : null;
            
            // Extract analytics from response
            $analytics = null;
            $recentActivity = [];
            $members = [];
            $chatSpaces = [];
            
            if ($analyticsData && ($analyticsData['success'] ?? false)) {
                $analytics = $analyticsData['analytics'] ?? null;
                $recentActivity = $analyticsData['recentActivity'] ?? [];
                $members = $analyticsData['members'] ?? [];
                $chatSpaces = $analyticsData['chatSpaces'] ?? [];
            }

        } catch (\Exception $e) {
            Log::error('Failed to fetch group analytics', [
                'error' => $e->getMessage(),
                'course' => $course,
                'group' => $group,
            ]);
            $courseData = null;
            $groupData = null;
            $analytics = null;
            $recentActivity = [];
            $members = [];
            $chatSpaces = [];
        }

        if (!$courseData || !$groupData) {
            abort(404, 'Course or group not found');
        }

        return Inertia::render('lecturer/analytics/show', [
            'course' => $courseData,
            'group' => $groupData,
            'analytics' => $analytics ?? [
                'qualityScore' => null,
                'hotPercentage' => 0,
                'local_message_count' => 0,
                'engagementDistribution' => [
                    'cognitive' => 0,
                    'behavioral' => 0,
                    'emotional' => 0,
                ],
                'qualityBreakdown' => [
                    'lexical_variety' => 0,
                    'hot_percentage' => 0,
                    'participation' => 0,
                ],
                'recommendation' => null,
            ],
            'members' => $members,
            'chatSpaces' => $chatSpaces,
            'recentActivity' => $recentActivity,
            'socketUrl' => config('services.api.socket_url', 'http://localhost:3000'),
        ]);
    }

    /**
     * Export Process Mining Data
     * Returns CSV/JSON export of event logs for research
     */
    public function export(Request $request, string $course)
    {
        $format = $request->get('format', 'json');

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/analytics/export", [
                'courseId' => $course,
                'format' => $format,
            ]);

            if ($response->successful()) {
                $data = $response->json('data');
                
                if ($format === 'csv') {
                    return response($data['content'], 200, [
                        'Content-Type' => 'text/csv',
                        'Content-Disposition' => "attachment; filename=\"course_{$course}_analytics.csv\"",
                    ]);
                }

                return response()->json($data);
            }

            return back()->withErrors(['export' => 'Failed to export analytics data']);
        } catch (\Exception $e) {
            Log::error('Failed to export analytics', ['error' => $e->getMessage()]);
            return back()->withErrors(['export' => 'Unable to export data at this time']);
        }
    }

    /**
     * Real-time Dashboard (AJAX endpoint for live updates)
     */
    public function liveStats(string $course)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/analytics/courses/{$course}/live");

            if ($response->successful()) {
                return response()->json($response->json('data'));
            }

            return response()->json(['error' => 'Failed to fetch live stats'], 500);
        } catch (\Exception $e) {
            Log::error('Failed to fetch live stats', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Unable to fetch live stats'], 500);
        }
    }
}
