<?php

namespace App\Http\Controllers\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\CourseMaterial;
use App\Models\MaterialModule;
use App\Models\MaterialView;
use App\Services\CoreApiInternalClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LecturerMaterialsController extends Controller
{
    public function __construct(
        private readonly CoreApiInternalClient $coreApiInternal
    ) {}
    /**
     * List modules with materials for a course.
     */
    public function index(string $course): JsonResponse
    {
        $modules = MaterialModule::where('course_id', $course)
            ->orderBy('sort_order')
            ->with(['materials' => function ($query) {
                $query->orderBy('sort_order')->orderBy('created_at', 'desc');
            }])
            ->get();

        // Get unassigned materials (no module)
        $unassigned = CourseMaterial::where('course_id', $course)
            ->whereNull('module_id')
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'modules' => $modules,
            'unassigned' => $unassigned,
        ]);
    }

    /**
     * Create a new module.
     */
    public function storeModule(Request $request, string $course): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $maxOrder = MaterialModule::where('course_id', $course)->max('sort_order') ?? 0;

        $module = MaterialModule::create([
            'id' => (string) Str::uuid(),
            'course_id' => $course,
            'title' => $validated['title'],
            'sort_order' => $validated['sort_order'] ?? ($maxOrder + 1),
        ]);

        return response()->json(['data' => $module], 201);
    }

    /**
     * Update a module.
     */
    public function updateModule(Request $request, string $course, string $moduleId): JsonResponse
    {
        $module = MaterialModule::where('course_id', $course)->findOrFail($moduleId);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $module->update($validated);

        return response()->json(['data' => $module]);
    }

    /**
     * Delete a module (materials become unassigned).
     */
    public function destroyModule(string $course, string $moduleId): JsonResponse
    {
        $module = MaterialModule::where('course_id', $course)->findOrFail($moduleId);

        // Unassign materials from this module
        CourseMaterial::where('module_id', $moduleId)->update(['module_id' => null]);

        $module->delete();

        return response()->json(['message' => 'Modul berhasil dihapus.']);
    }

    /**
     * Reorder modules.
     */
    public function reorderModules(Request $request, string $course): JsonResponse
    {
        $validated = $request->validate([
            'order' => 'required|array|min:1',
            'order.*.id' => 'required|string',
            'order.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['order'] as $item) {
            MaterialModule::where('id', $item['id'])
                ->where('course_id', $course)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Urutan modul berhasil diperbarui.']);
    }

    /**
     * Upload a material.
     */
    public function store(Request $request, string $course): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file' => 'required|file|max:51200', // 50MB max
            'extract_images' => 'sometimes|boolean',
            'perform_ocr' => 'sometimes|boolean',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Store file
        $path = $file->store("materials/{$course}", 'public');

        $title = $validated['title'] ?? null;
        if (empty($title)) {
            $title = pathinfo($fileName, PATHINFO_FILENAME);
        }

        $material = CourseMaterial::create([
            'id' => (string) Str::uuid(),
            'course_id' => $course,
            'title' => $title,
            'description' => $validated['description'] ?? null,
            'file_name' => $fileName,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'uploaded_by' => session('user.id') ?? null,
            'sort_order' => (CourseMaterial::where('course_id', $course)
                ->max('sort_order') ?? 0) + 1,
        ]);

        $absolutePath = Storage::disk('public')->path($path);
        $uploaderId = (string) (session('user.id') ?? '00000000-0000-0000-0000-000000000000');
        $queuePayload = [
            'course_id' => $course,
            'course_material_id' => $material->id,
            'file_path' => $absolutePath,
            'file_name' => $fileName,
            'mime_type' => $fileType ?? 'application/octet-stream',
            'file_size' => (int) $fileSize,
            'uploaded_by' => $uploaderId,
        ];
        if ($request->boolean('extract_images')) {
            $queuePayload['extract_images'] = true;
        }
        if ($request->boolean('perform_ocr')) {
            $queuePayload['perform_ocr'] = true;
        }
        $this->coreApiInternal->queueCourseMaterial($queuePayload);

        return response()->json([
            'data' => $material,
            'meta' => [
                'ai_index_configured' => $this->coreApiInternal->isConfigured(),
            ],
        ], 201);
    }

    /**
     * Update material metadata.
     */
    public function update(Request $request, string $course, string $materialId): JsonResponse
    {
        $material = CourseMaterial::where('course_id', $course)->findOrFail($materialId);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $material->update($validated);

        return response()->json(['data' => $material]);
    }

    /**
     * Delete material.
     */
    public function destroy(string $course, string $materialId): JsonResponse
    {
        $material = CourseMaterial::where('course_id', $course)->findOrFail($materialId);

        // Delete file from storage
        $this->coreApiInternal->deleteCourseMaterialKb($course, $materialId);

        if (Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json(['message' => 'Materi berhasil dihapus.']);
    }

    /**
     * Record a material view.
     */
    public function recordView(Request $request, string $course, string $materialId): JsonResponse
    {
        $material = CourseMaterial::where('course_id', $course)->findOrFail($materialId);

        $studentId = session('user.id');
        if (!$studentId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if already viewed recently (within 1 hour)
        $recentView = MaterialView::where('material_id', $materialId)
            ->where('student_id', $studentId)
            ->where('viewed_at', '>=', now()->subHour())
            ->exists();

        if (!$recentView) {
            MaterialView::create([
                'id' => (string) Str::uuid(),
                'material_id' => $materialId,
                'student_id' => $studentId,
            ]);

            $material->increment('view_count');
        }

        return response()->json([
            'view_count' => $material->fresh()->view_count,
        ]);
    }

    /**
     * Get material view stats.
     */
    public function viewStats(string $course, string $materialId): JsonResponse
    {
        $material = CourseMaterial::where('course_id', $course)->findOrFail($materialId);

        $totalViews = $material->view_count;
        $uniqueViewers = MaterialView::where('material_id', $materialId)
            ->distinct('student_id')
            ->count();

        $recentViews = MaterialView::where('material_id', $materialId)
            ->orderBy('viewed_at', 'desc')
            ->limit(10)
            ->get(['student_id', 'viewed_at']);

        return response()->json([
            'total_views' => $totalViews,
            'unique_viewers' => $uniqueViewers,
            'recent_views' => $recentViews,
        ]);
    }

    /**
     * Re-trigger KB indexing for an existing material.
     */
    public function reindex(string $course, string $materialId): JsonResponse
    {
        $material = CourseMaterial::where('course_id', $course)->findOrFail($materialId);

        if (! Storage::disk('public')->exists($material->file_path)) {
            return response()->json(['message' => 'File tidak ditemukan di storage.'], 404);
        }

        $absolutePath = Storage::disk('public')->path($material->file_path);
        $uploaderId = (string) (session('user.id') ?? '00000000-0000-0000-0000-000000000000');

        $this->coreApiInternal->queueCourseMaterial([
            'course_id' => $course,
            'course_material_id' => $material->id,
            'file_path' => $absolutePath,
            'file_name' => $material->file_name,
            'mime_type' => $material->file_type ?? 'application/octet-stream',
            'file_size' => (int) $material->file_size,
            'uploaded_by' => $uploaderId,
        ]);

        return response()->json([
            'message' => 'Antrian indeks berhasil dikirim.',
            'meta' => ['ai_index_configured' => $this->coreApiInternal->isConfigured()],
        ]);
    }

}
