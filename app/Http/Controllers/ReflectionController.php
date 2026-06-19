<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ReflectionController extends Controller
{

    /**
     * List User's Reflections
     */
    public function index(): Response
    {
        $reflections = [];
        $courses = [];

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/reflections/me');
            $reflections = $response->successful() ? $response->json('data', []) : [];
        } catch (ConnectionException | RequestException $e) {
            Log::error('Failed to fetch reflections', ['error' => $e->getMessage()]);
            $reflections = [];
        }

        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . '/api/courses/enrolled');
            $courses = $courseResponse->successful() ? $courseResponse->json('data', []) : [];
        } catch (ConnectionException | RequestException $e) {
            Log::error('Failed to fetch enrolled courses', ['error' => $e->getMessage()]);
            $courses = [];
        }

        return Inertia::render('student/reflections/index', [
            'reflections' => $reflections,
            'courses' => $courses,
        ]);
    }

    /**
     * Store Reflection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'goal_id' => 'nullable|string',
            'course_id' => 'nullable|string',
            'type' => 'nullable|in:session,weekly',
            'content' => 'required|string|min:20',
        ]);

        $payload = array_filter([
            'goalId' => $validated['goal_id'] ?? null,
            'courseId' => $validated['course_id'] ?? null,
            'type' => $validated['type'] ?? 'weekly',
            'content' => $validated['content'],
        ], static fn ($v) => $v !== null);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/reflections', $payload);

            if ($response->successful()) {
                return back()->with('success', 'Reflection saved successfully!');
            }

            return back()->withErrors(['content' => $response->json('message', 'Failed to save reflection')]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('Reflection creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['content' => 'Unable to save reflection']);
        }
    }
}
