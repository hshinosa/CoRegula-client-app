<?php

namespace App\Http\Controllers;

use App\Models\ReflectionTag;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReflectionAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $userId = session('user.id', '');
        $period = $request->input('period', 'month');

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/reflections/me');
            $reflections = $response->successful() ? $response->json('data', []) : [];
        } catch (ConnectionException $e) {
            Log::error('Failed to fetch reflections for analytics', ['error' => $e->getMessage()]);
            $reflections = [];
        } catch (RequestException $e) {
            Log::error('Failed to fetch reflections for analytics', ['error' => $e->getMessage()]);
            $reflections = [];
        }

        $now = now();
        $filtered = array_filter($reflections, function ($r) use ($period, $now) {
            $date = $r['created_at'] ?? $r['createdAt'] ?? null;
            if (!$date) return false;
            $d = strtotime($date);
            return match ($period) {
                'week' => $d >= strtotime('-7 days'),
                'year' => $d >= strtotime('-1 year'),
                default => $d >= strtotime('-30 days'),
            };
        });

        $filtered = array_values($filtered);

        return response()->json([
            'data' => [
                'frequency' => $this->buildFrequency($filtered, $period),
                'averageLength' => $this->buildAverageLength($filtered, $period),
                'streak' => $this->buildStreak($reflections),
                'topTags' => $this->buildTopTags($userId),
                'timeline' => $this->buildTimeline($filtered, $period),
                'totalReflections' => count($filtered),
                'period' => $period,
            ],
        ]);
    }

    private function buildFrequency(array $reflections, string $period): array
    {
        $buckets = [];
        foreach ($reflections as $r) {
            $date = $r['created_at'] ?? $r['createdAt'] ?? null;
            if (!$date) continue;
            $key = match ($period) {
                'week' => date('Y-m-d', strtotime($date)),
                'year' => date('Y-m', strtotime($date)),
                default => date('Y-m-d', strtotime($date)),
            };
            $buckets[$key] = ($buckets[$key] ?? 0) + 1;
        }

        $result = [];
        foreach ($buckets as $label => $count) {
            $result[] = ['label' => $label, 'count' => $count];
        }

        usort($result, fn($a, $b) => strcmp($a['label'], $b['label']));
        return $result;
    }

    private function buildAverageLength(array $reflections, string $period): array
    {
        $buckets = [];
        foreach ($reflections as $r) {
            $date = $r['created_at'] ?? $r['createdAt'] ?? null;
            $content = $r['content'] ?? '';
            if (!$date) continue;
            $key = match ($period) {
                'week' => date('Y-m-d', strtotime($date)),
                'year' => date('Y-m', strtotime($date)),
                default => date('Y-m-d', strtotime($date)),
            };
            if (!isset($buckets[$key])) {
                $buckets[$key] = ['total' => 0, 'count' => 0];
            }
            $buckets[$key]['total'] += str_word_count(strip_tags($content));
            $buckets[$key]['count']++;
        }

        $result = [];
        foreach ($buckets as $label => $data) {
            $result[] = [
                'label' => $label,
                'average' => $data['count'] > 0 ? round($data['total'] / $data['count']) : 0,
            ];
        }

        usort($result, fn($a, $b) => strcmp($a['label'], $b['label']));
        return $result;
    }

    private function buildStreak(array $reflections): array
    {
        if (empty($reflections)) {
            return ['current' => 0, 'longest' => 0, 'hasReflectionToday' => false];
        }

        $dates = [];
        foreach ($reflections as $r) {
            $date = $r['created_at'] ?? $r['createdAt'] ?? null;
            if ($date) {
                $dates[] = date('Y-m-d', strtotime($date));
            }
        }

        $dates = array_unique($dates);
        rsort($dates);

        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $hasReflectionToday = in_array($today, $dates);
        $hasReflectionYesterday = in_array($yesterday, $dates);

        $current = 0;
        if ($hasReflectionToday || $hasReflectionYesterday) {
            $startDate = $hasReflectionToday ? $today : $yesterday;
            $checkDate = $startDate;
            while (in_array($checkDate, $dates)) {
                $current++;
                $checkDate = date('Y-m-d', strtotime($checkDate . ' -1 day'));
            }
        }

        $longest = 0;
        $tempStreak = 0;
        sort($dates);
        for ($i = 0; $i < count($dates); $i++) {
            if ($i === 0) {
                $tempStreak = 1;
            } else {
                $diff = (strtotime($dates[$i]) - strtotime($dates[$i - 1])) / 86400;
                if ($diff == 1) {
                    $tempStreak++;
                } else {
                    $tempStreak = 1;
                }
            }
            $longest = max($longest, $tempStreak);
        }

        return [
            'current' => $current,
            'longest' => $longest,
            'hasReflectionToday' => $hasReflectionToday,
        ];
    }

    private function buildTopTags(?string $userId): array
    {
        if (!$userId) return [];

        return ReflectionTag::forUser($userId)
            ->selectRaw('tag, COUNT(*) as count')
            ->groupBy('tag')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function buildTimeline(array $reflections, string $period): array
    {
        $buckets = [];
        foreach ($reflections as $r) {
            $date = $r['created_at'] ?? $r['createdAt'] ?? null;
            $content = $r['content'] ?? '';
            if (!$date) continue;
            $key = match ($period) {
                'week' => date('Y-m-d', strtotime($date)),
                'year' => date('Y-m', strtotime($date)),
                default => date('Y-m-d', strtotime($date)),
            };
            if (!isset($buckets[$key])) {
                $buckets[$key] = ['count' => 0, 'totalWords' => 0];
            }
            $buckets[$key]['count']++;
            $buckets[$key]['totalWords'] += str_word_count(strip_tags($content));
        }

        $result = [];
        foreach ($buckets as $label => $data) {
            $result[] = [
                'label' => $label,
                'count' => $data['count'],
                'averageWords' => $data['count'] > 0 ? round($data['totalWords'] / $data['count']) : 0,
            ];
        }

        usort($result, fn($a, $b) => strcmp($a['label'], $b['label']));
        return $result;
    }
}
