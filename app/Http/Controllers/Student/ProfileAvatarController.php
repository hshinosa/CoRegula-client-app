<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\UserAvatar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileAvatarController extends Controller
{
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
    private const MAX_FILE_SIZE = 2 * 1024 * 1024;
    private const SIZES = [
        'thumbnail' => 50,
        'medium' => 200,
        'large' => 500,
    ];

    public function store(Request $request): JsonResponse
    {
        $user = session('user');
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'avatar' => 'required|file|mimes:jpeg,png,webp|max:2048',
            'crop_x' => 'nullable|numeric|min:0',
            'crop_y' => 'nullable|numeric|min:0',
            'crop_width' => 'nullable|numeric|min:50',
            'crop_height' => 'nullable|numeric|min:50',
        ]);

        $file = $request->file('avatar');

        $imageInfo = @getimagesize($file->getPathname());
        if (!$imageInfo || $imageInfo[0] < 100 || $imageInfo[1] < 100) {
            return response()->json(['message' => 'Gambar minimal 100x100 piksel'], 422);
        }
        if ($imageInfo[0] > 2000 || $imageInfo[1] > 2000) {
            return response()->json(['message' => 'Gambar maksimal 2000x2000 piksel'], 422);
        }

        $userId = $user['id'];
        $this->deleteExistingAvatar($userId);

        $avatarDir = "avatars/{$userId}";
        $extension = $file->guessExtension() ?? 'jpg';
        $filename = Str::uuid() . ".{$extension}";

        $originalPath = $file->storeAs($avatarDir, "original_{$filename}", 'public');

        $cropParams = null;
        if ($request->has('crop_x')) {
            $cropParams = [
                'x' => (int) $request->input('crop_x'),
                'y' => (int) $request->input('crop_y'),
                'width' => (int) $request->input('crop_width'),
                'height' => (int) $request->input('crop_height'),
            ];
        }

        $paths = ['original_path' => $originalPath];
        foreach (self::SIZES as $sizeName => $dimension) {
            $resizedFilename = "{$sizeName}_{$filename}";
            $resizedPath = "{$avatarDir}/{$resizedFilename}";

            $this->resizeImage(
                $file->getPathname(),
                $resizedPath,
                $dimension,
                $extension,
                $cropParams
            );

            $paths["{$sizeName}_path"] = $resizedPath;
        }

        $avatar = UserAvatar::updateOrCreate(
            ['user_id' => $userId],
            array_merge($paths, [
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ])
        );

        return response()->json([
            'message' => 'Avatar berhasil diunggah',
            'data' => [
                'urls' => $avatar->getUrls(),
            ],
        ]);
    }

    public function destroy(): JsonResponse
    {
        $user = session('user');
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $this->deleteExistingAvatar($user['id']);

        return response()->json(['message' => 'Avatar berhasil dihapus']);
    }

    private function deleteExistingAvatar(string $userId): void
    {
        $existing = UserAvatar::where('user_id', $userId)->first();
        if ($existing) {
            $pathsToClean = array_filter([
                $existing->original_path,
                $existing->thumbnail_path,
                $existing->medium_path,
                $existing->large_path,
            ]);
            foreach ($pathsToClean as $path) {
                Storage::disk('public')->delete($path);
            }
            $existing->delete();
        }
    }

    private function resizeImage(
        string $sourcePath,
        string $destPath,
        int $targetSize,
        string $extension,
        ?array $cropParams
    ): void {
        $source = imagecreatefromstring(file_get_contents($sourcePath));
        if (!$source) {
            return;
        }

        $srcX = 0;
        $srcY = 0;
        $srcW = imagesx($source);
        $srcH = imagesy($source);

        if ($cropParams) {
            $srcX = max(0, min($cropParams['x'], $srcW - 1));
            $srcY = max(0, min($cropParams['y'], $srcH - 1));
            $srcW = max(1, min($cropParams['width'], $srcW - $srcX));
            $srcH = max(1, min($cropParams['height'], $srcH - $srcY));
        }

        $cropSize = min($srcW, $srcH);
        if ($srcW > $srcH) {
            $srcX += (int) (($srcW - $cropSize) / 2);
        } else {
            $srcY += (int) (($srcH - $cropSize) / 2);
        }

        $dest = imagecreatetruecolor($targetSize, $targetSize);

        if ($extension === 'png') {
            imagealphablending($dest, false);
            imagesavealpha($dest, true);
        } elseif ($extension === 'webp') {
            imagealphablending($dest, false);
            imagesavealpha($dest, true);
        }

        imagecopyresampled(
            $dest, $source,
            0, 0,
            $srcX, $srcY,
            $targetSize, $targetSize,
            $cropSize, $cropSize
        );

        $fullPath = Storage::disk('public')->path($destPath);
        Storage::disk('public')->makeDirectory(dirname($destPath));

        match ($extension) {
            'png' => imagepng($dest, $fullPath, 6),
            'webp' => imagewebp($dest, $fullPath, 85),
            default => imagejpeg($dest, $fullPath, 85),
        };

        imagedestroy($source);
        imagedestroy($dest);
    }
}
