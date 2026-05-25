<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfilePreferenceController extends Controller
{
    public function index(): JsonResponse
    {
        $user = session('user');
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $preference = UserPreference::firstOrCreate(
            ['user_id' => $user['id']],
            UserPreference::defaultsFor($user['id'])
        );

        return response()->json(['data' => $preference->toResponseArray()]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = session('user');
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'notifications.email' => 'sometimes|boolean',
            'notifications.push' => 'sometimes|boolean',
            'notifications.tasks' => 'sometimes|boolean',
            'notifications.chat' => 'sometimes|boolean',
            'notifications.groups' => 'sometimes|boolean',
            'language' => 'sometimes|in:id,en',
            'theme' => 'sometimes|in:light,dark,system',
            'font_size' => 'sometimes|in:small,normal,large',
        ]);

        $preference = UserPreference::firstOrCreate(
            ['user_id' => $user['id']],
            UserPreference::defaultsFor($user['id'])
        );

        $updateData = [];

        if (isset($validated['notifications'])) {
            foreach ($validated['notifications'] as $key => $value) {
                $updateData["notifications_{$key}"] = $value;
            }
        }

        if (isset($validated['language'])) {
            $updateData['language'] = $validated['language'];
        }
        if (isset($validated['theme'])) {
            $updateData['theme'] = $validated['theme'];
        }
        if (isset($validated['font_size'])) {
            $updateData['font_size'] = $validated['font_size'];
        }

        if (!empty($updateData)) {
            $preference->update($updateData);
        }

        return response()->json([
            'message' => 'Preferensi tersimpan',
            'data' => $preference->fresh()->toResponseArray(),
        ]);
    }
}
