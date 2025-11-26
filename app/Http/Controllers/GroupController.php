<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
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
     * List Groups in a Course (Lecturer view)
     */
    public function index(string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/groups");
            $studentsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/students");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $groups = $groupsResponse->successful() ? $groupsResponse->json('data', []) : [];
            $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch groups', ['error' => $e->getMessage()]);
            $courseData = null;
            $groups = [];
            $students = [];
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('lecturer/groups/index', [
            'course' => $courseData,
            'groups' => $groups,
            'students' => $students,
        ]);
    }

    /**
     * List Groups in a Course (Student view)
     */
    public function studentIndex(string $course): Response
    {
        try {
            $courseResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}");
            $groupsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/groups");
            $myGroupResponse = $this->apiRequest()->get($this->apiUrl() . "/api/groups/my/{$course}");
            $studentsResponse = $this->apiRequest()->get($this->apiUrl() . "/api/courses/{$course}/students");

            $courseData = $courseResponse->successful() ? $courseResponse->json('data') : null;
            $groups = $groupsResponse->successful() ? $groupsResponse->json('data', []) : [];
            $myGroup = $myGroupResponse->successful() ? $myGroupResponse->json('data') : null;
            $students = $studentsResponse->successful() ? $studentsResponse->json('data', []) : [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch student groups', ['error' => $e->getMessage()]);
            $courseData = null;
            $groups = [];
            $myGroup = null;
            $students = [];
        }

        if (!$courseData) {
            abort(404, 'Course not found');
        }

        return Inertia::render('student/groups/index', [
            'course' => $courseData,
            'groups' => $groups,
            'myGroup' => $myGroup,
            'students' => $students,
        ]);
    }

    /**
     * Create New Group (Lecturer or Student)
     */
    public function store(Request $request, string $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/courses/{$course}/groups", [
                'name' => $validated['name'],
            ]);

            if ($response->successful()) {
                return back()->with('success', 'Grup berhasil dibuat!');
            }

            return back()->withErrors(['name' => $response->json('message', 'Gagal membuat grup')]);
        } catch (\Exception $e) {
            Log::error('Group creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['name' => 'Tidak dapat membuat grup']);
        }
    }

    /**
     * Join Group by Code (Student)
     */
    public function join(Request $request)
    {
        $validated = $request->validate([
            'join_code' => 'required|string|size:8',
        ]);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/groups/join", [
                'join_code' => strtoupper($validated['join_code']),
            ]);

            if ($response->successful()) {
                $groupData = $response->json('data');
                $courseId = $groupData['courseId'] ?? null;
                
                // Redirect to goal creation page
                if ($courseId) {
                    return redirect()
                        ->route('student.goals.create', ['course' => $courseId])
                        ->with('success', 'Berhasil bergabung dengan grup! Silakan tetapkan tujuan pembelajaran Anda.');
                }
                
                return back()->with('success', 'Berhasil bergabung dengan grup!');
            }

            return back()->withErrors(['join_code' => $response->json('message', 'Kode tidak valid')]);
        } catch (\Exception $e) {
            Log::error('Group join failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['join_code' => 'Tidak dapat bergabung dengan grup']);
        }
    }

    /**
     * Invite Members to Group
     */
    public function inviteMembers(Request $request, string $group)
    {
        $validated = $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/groups/{$group}/invite",
                ['member_ids' => $validated['member_ids']]
            );

            if ($response->successful()) {
                return back()->with('success', 'Anggota berhasil diundang!');
            }

            return back()->withErrors(['member_ids' => $response->json('message', 'Gagal mengundang anggota')]);
        } catch (\Exception $e) {
            Log::error('Invite members failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['member_ids' => 'Tidak dapat mengundang anggota']);
        }
    }

    /**
     * Add Members to Group (Lecturer only - legacy)
     */
    public function addMembers(Request $request, string $course, string $group)
    {
        $validated = $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'string',
        ]);

        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/courses/{$course}/groups/{$group}/members",
                ['member_ids' => $validated['member_ids']]
            );

            if ($response->successful()) {
                return back()->with('success', 'Anggota berhasil ditambahkan!');
            }

            return back()->withErrors(['member_ids' => $response->json('message', 'Gagal menambahkan anggota')]);
        } catch (\Exception $e) {
            Log::error('Add members failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['member_ids' => 'Tidak dapat menambahkan anggota']);
        }
    }

    /**
     * Create Chat Space in Group
     */
    public function storeChatSpace(Request $request, string $group)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'nullable|string|max:200',
        ]);

        try {
            $response = $this->apiRequest()->post(
                $this->apiUrl() . "/api/groups/{$group}/chat-spaces",
                $validated
            );

            if ($response->successful()) {
                return back()->with('success', 'Ruang chat berhasil dibuat!');
            }

            return back()->withErrors(['name' => $response->json('message', 'Gagal membuat ruang chat')]);
        } catch (\Exception $e) {
            Log::error('Create chat space failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['name' => 'Tidak dapat membuat ruang chat']);
        }
    }

    /**
     * Delete Group (Lecturer only)
     */
    public function destroy(string $course, string $group)
    {
        try {
            $response = $this->apiRequest()->delete(
                $this->apiUrl() . "/api/groups/{$group}"
            );

            if ($response->successful()) {
                return back()->with('success', 'Grup berhasil dihapus!');
            }

            Log::error('Delete group failed', [
                'course' => $course,
                'group' => $group,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return back()->withErrors(['group' => $response->json('message', 'Gagal menghapus grup')]);
        } catch (\Exception $e) {
            Log::error('Delete group exception', [
                'course' => $course,
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['group' => 'Tidak dapat menghapus grup']);
        }
    }
}
