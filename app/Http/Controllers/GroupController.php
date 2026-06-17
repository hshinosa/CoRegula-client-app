<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;

class GroupController extends Controller
{

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
        } catch (ConnectionException | RequestException $e) {
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
        } catch (ConnectionException | RequestException $e) {
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

    public function showStudent(string $group)
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . "/api/groups/{$group}");
            $groupData = $response->successful() ? $response->json('data') : null;

            if (!$groupData) {
                abort(404, 'Group not found');
            }

            return Inertia::render('student/groups/show', [
                'group' => $groupData,
            ]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('Failed to fetch group details', ['error' => $e->getMessage()]);
            abort(500, 'Failed to load group details');
        }
    }

    public function store(Request $request, string $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $startTime = microtime(true);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/courses/{$course}/groups", [
                'name' => $validated['name'],
            ]);

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::info('Group creation completed', ['course_id' => $course, 'duration_ms' => $duration]);

            if ($response->successful()) {
                return back()->with('success', 'Grup berhasil dibuat!');
            }

            return back()->withErrors(['name' => $response->json('message', 'Gagal membuat grup')]);
        } catch (ConnectionException | RequestException $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::error('Failed to create group', ['course_id' => $course, 'duration_ms' => $duration, 'error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to create group']);
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
        } catch (ConnectionException | RequestException $e) {
            Log::error('Failed to delete group', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to delete group']);
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
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/groups/{$group}/invite", ['member_ids' => $validated['member_ids']]);

            if ($response->successful()) {
                return back()->with('success', 'Anggota berhasil diundang!');
            }

            return back()->withErrors(['member_ids' => $response->json('message', 'Gagal mengundang anggota')]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('Failed to update group', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to update group']);
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

        $startTime = microtime(true);

        try {
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/courses/{$course}/groups/{$group}/members", ['member_ids' => $validated['member_ids']]);

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::info('Add members completed', ['course_id' => $course, 'group_id' => $group, 'duration_ms' => $duration]);

            if ($response->successful()) {
                return back()->with('success', 'Anggota berhasil ditambahkan!');
            }

            return back()->withErrors(['member_ids' => $response->json('message', 'Gagal menambahkan anggota')]);
        } catch (ConnectionException | RequestException $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            Log::error('Failed to add members', ['course_id' => $course, 'group_id' => $group, 'duration_ms' => $duration, 'error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to add members']);
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
            'week_id' => 'required|uuid',
            'course_id' => 'nullable|uuid',
        ]);

        try {
            $payload = [
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'week_id' => $validated['week_id'],
            ];
            $response = $this->apiRequest()->post($this->apiUrl() . "/api/groups/{$group}/chat-spaces", $payload);

            if ($response->successful()) {
                $chatId = $response->json('data.id');
                $courseId = $validated['course_id'] ?? null;
                $role = session('user.role') ?? null;
                if ($chatId && $courseId && $role === 'student') {
                    return redirect()->route('student.chat-spaces.pre-read.show', [
                        'course' => $courseId,
                        'chatSpace' => $chatId,
                    ]);
                }

                return back()->with('success', 'Ruang chat berhasil dibuat!');
            }

            return back()->withErrors(['name' => $response->json('message', 'Gagal membuat ruang chat')]);
        } catch (ConnectionException | RequestException $e) {
            Log::error('Failed to leave group', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to leave group']);
        }
    }

    /**
     * Delete Group (Lecturer only)
     */
    public function destroy(string $course, string $group)
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . "/api/groups/{$group}");

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
        } catch (ConnectionException $e) {
            Log::error('Delete group exception', [
                'course' => $course,
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['group' => 'Tidak dapat menghapus grup']);
        } catch (RequestException $e) {
            Log::error('Delete group exception', [
                'course' => $course,
                'group' => $group,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['group' => 'Tidak dapat menghapus grup']);
        }
    }
}
