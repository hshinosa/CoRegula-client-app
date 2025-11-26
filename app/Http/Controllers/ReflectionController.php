<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ReflectionController extends Controller
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
     * List User's Reflections
     */
    public function index(): Response
    {
        $reflections = [];
        $courses = [];

        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/reflections/me');
            $reflections = $response->successful() ? $response->json('data', []) : [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch reflections', ['error' => $e->getMessage()]);
            $reflections = [];
        }

        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . '/api/courses/enrolled');
            $courses = $courseResponse->successful() ? $courseResponse->json('data', []) : [];
        } catch (\Exception $e) {
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
            'content' => 'required|string|min:10',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . '/api/reflections', $validated);

            if ($response->successful()) {
                return back()->with('success', 'Reflection saved successfully!');
            }

            return back()->withErrors(['content' => $response->json('message', 'Failed to save reflection')]);
        } catch (\Exception $e) {
            Log::error('Reflection creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['content' => 'Unable to save reflection']);
        }
    }
}
