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
     * Show Goal Creation Page for a specific Chat Space
     */
    public function create(string $course, string $chatSpace): Response|\Illuminate\Http\RedirectResponse
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/my-group");
            $chatSpaceResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/chat-spaces/{$chatSpace}");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $group = $groupResponse->successful() ? $groupResponse->json('data') : null;
            $chatSpaceData = $chatSpaceResponse->successful() ? $chatSpaceResponse->json('data') : null;
        } catch (ConnectionException $e) {
            Log::error('Failed to fetch goal creation data', ['error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceData = null;
        } catch (RequestException $e) {
            Log::error('Failed to fetch goal creation data', ['error' => $e->getMessage()]);
            $courseData = null;
            $group = null;
            $chatSpaceData = null;
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        if (
            $chatSpaceData
            && empty($chatSpaceData['isClosed'])
            && ! empty($chatSpaceData['weekId'])
            && empty($chatSpaceData['hasPreReadCompleted'])
        ) {
            return redirect()->route('student.chat-spaces.pre-read.show', [
                'course' => $course,
                'chatSpace' => $chatSpace,
            ]);
        }

        // If chat space already has a shared goal (myGoal), redirect to chat spaces list
        // This means another group member already set the goal for everyone
        if ($chatSpaceData && isset($chatSpaceData['myGoal']) && $chatSpaceData['myGoal']) {
            return redirect()->route('student.courses.chat-spaces', ['course' => $course])
                ->with('info', 'Goal sudah ditetapkan oleh anggota grup lain. Silakan masuk ke sesi diskusi.');
        }

        return Inertia::render('student/goals/create', [
            'course' => $courseData,
            'group' => $group,
            'chatSpace' => $chatSpaceData,
        ]);
    }

    /**
     * Store Learning Goal
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'chat_space_id' => 'required|string',
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
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/goals', [
                'chat_space_id' => $validated['chat_space_id'],
                'content' => $validated['content'],
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
            Log::error('Goal creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['content' => 'Unable to save goal']);
        }
    }
}
