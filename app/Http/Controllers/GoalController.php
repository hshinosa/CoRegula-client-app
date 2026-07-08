<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{

    /**
     * Show Goal Creation Page for a specific Sesi Diskusi
     */
    public function create(string $course, string $sessionDiscussion): Response|\Illuminate\Http\RedirectResponse
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $sessionDiscussionResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/session-discussions/{$sessionDiscussion}");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
            $sessionDiscussionData = $sessionDiscussionResponse->successful() ? $sessionDiscussionResponse->json('data') : null;
        } catch (ConnectionException $e) {
            Log::error('Failed to fetch goal creation data', ['error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $sessionDiscussionData = null;
        } catch (RequestException $e) {
            Log::error('Failed to fetch goal creation data', ['error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $sessionDiscussionData = null;
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        if (
            $sessionDiscussionData
            && empty($sessionDiscussionData['isClosed'])
            && ! empty($sessionDiscussionData['weekId'])
            && empty($sessionDiscussionData['hasPreReadCompleted'])
        ) {
            return redirect()->route('student.session-discussions.pre-read.show', [
                'course' => $course,
                'sessionDiscussion' => $sessionDiscussion,
            ]);
        }

        // If sesi diskusi already has a shared goal (myGoal), redirect to unified course detail page.
        if ($sessionDiscussionData && isset($sessionDiscussionData['myGoal']) && $sessionDiscussionData['myGoal']) {
            return redirect()->route('student.courses.show', ['course' => $course])
                ->with('info', 'Goal sudah ditetapkan oleh anggota grup lain. Silakan masuk ke sesi diskusi.');
        }

        return Inertia::render('student/goals/create', [
            'course' => $courseData,
            'group' => $group,
            'sessionDiscussion' => $sessionDiscussionData,
        ]);
    }

    /**
     * Store Learning Goal
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'session_discussion_id' => 'required|string',
            'content' => 'required|string|min:20',
        ]);

        // Client-side should validate action verbs, but we double-check here
        // Bloom's Taxonomy verbs in Indonesian and English
        $actionVerbs = [
            // Mengingat (Remember)
            'mendefinisikan', 'mengidentifikasi', 'menyebutkan', 'mengenali', 'mengingat', 'menghafal', 'mendeskripsikan', 'menyatakan',
            'define', 'identify', 'list', 'name', 'recall', 'recognize', 'state', 'describe',
            // Memahami (Understand)
            'menjelaskan', 'merangkum', 'menafsirkan', 'mengklasifikasi', 'membandingkan', 'membedakan', 'mendiskusikan', 'mencontohkan',
            'explain', 'summarize', 'interpret', 'classify', 'compare', 'contrast', 'discuss',
            // Menerapkan (Apply)
            'menerapkan', 'mendemonstrasikan', 'mengimplementasikan', 'menyelesaikan', 'menggunakan', 'melaksanakan', 'mengilustrasikan', 'mempraktikkan',
            'apply', 'demonstrate', 'implement', 'solve', 'use', 'execute', 'illustrate',
            // Menganalisis (Analyze)
            'menganalisis', 'memeriksa', 'menguraikan', 'menyelidiki', 'mengorganisasi', 'menghubungkan', 'mengkritisi',
            'analyze', 'differentiate', 'examine', 'investigate', 'organize',
            // Mengevaluasi (Evaluate)
            'mengevaluasi', 'menilai', 'mengkritik', 'memutuskan', 'membenarkan', 'merekomendasikan', 'menyimpulkan', 'mempertahankan',
            'evaluate', 'assess', 'critique', 'judge', 'justify', 'recommend', 'support',
            // Mencipta (Create)
            'menciptakan', 'merancang', 'mengembangkan', 'membangun', 'memproduksi', 'merencanakan', 'menyusun', 'menghasilkan',
            'create', 'design', 'develop', 'construct', 'produce', 'plan', 'compose',
        ];

        $hasActionVerb = false;
        $contentLower = strtolower($validated['content']);
        
        foreach ($actionVerbs as $verb) {
            if (str_contains($contentLower, $verb)) {
                $hasActionVerb = true;
                break;
            }
        }

        if (!$hasActionVerb) {
            return back()->withErrors([
                'content' => 'Tujuan harus mengandung kata kerja aksi dari Taksonomi Bloom (misalnya: menganalisis, merancang, membandingkan)',
            ]);
        }

        try {
            // Fetch week context from local MySQL if session_discussion has weekId
            $weekContext = null;
            try {
                $sessionDiscussionResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/session-discussions/{$validated['session_discussion_id']}");
                if ($sessionDiscussionResponse->successful()) {
                    $sessionDiscussionData = $sessionDiscussionResponse->json('data');
                    $weekId = $sessionDiscussionData['weekId'] ?? null;
                    
                    if ($weekId) {
                        $week = \App\Models\CourseWeek::with('materials')->find($weekId);
                        if ($week) {
                            $weekContext = [
                                'week_title' => $week->title,
                                'week_index' => $week->week_index,
                                'material_titles' => $week->materials->pluck('title')->toArray(),
                            ];
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to fetch week context', ['error' => $e->getMessage()]);
            }

            $response = $this->apiRequest()->post($this->apiUrl() . '/api/goals', [
                'session_discussion_id' => $validated['session_discussion_id'],
                'content' => $validated['content'],
                'week_context' => $weekContext,
            ]);

            if ($response->successful()) {
                return redirect()
                    ->back()
                    ->with('success', 'Learning goal saved! You can now access the chat.');
            }

            $body = $response->json();
            $message = $body['error']['message'] ?? $body['message'] ?? 'Failed to save goal';
            $details = $body['error']['details'] ?? [];
            $hint = is_array($details) ? ($details['socratic_hint'] ?? null) : null;
            if (is_string($hint) && $hint !== '') {
                $message = $hint;
            }

            return back()
                ->withInput()
                ->withErrors(['content' => $message]);
        } catch (ConnectionException $e) {
            Log::error('Goal creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['content' => 'Unable to save goal']);
        } catch (RequestException $e) {
            // Extract error message from core-api response
            $response = $e->response;
            $body = $response?->json() ?? [];
            $message = $body['error']['message'] ?? $body['message'] ?? 'Failed to save goal';
            $details = $body['error']['details'] ?? [];
            $hint = is_array($details) ? ($details['socratic_hint'] ?? null) : null;
            if (is_string($hint) && $hint !== '') {
                $message = $hint;
            }

            Log::error('Goal creation failed', ['error' => $e->getMessage(), 'message' => $message]);
            return back()->withInput()->withErrors(['content' => $message]);
        }
    }
}
