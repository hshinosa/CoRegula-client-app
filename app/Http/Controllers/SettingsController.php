<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SettingsController extends Controller
{
    public function index(): InertiaResponse
    {
        $user = session('user');

        if (!$user) {
            return redirect()->route('auth.login.index');
        }

        $profile = [];
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/users/me');
            if ($response->successful()) {
                $profile = $response->json('data', []);
            }
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to fetch profile', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to fetch profile', ['error' => $e->getMessage()]);
        }

        $preferences = [
            'theme' => $profile['theme_preference'] ?? 'light',
            'language' => $profile['language_preference'] ?? 'id',
            'notifications' => [
                'email' => $profile['notify_email'] ?? true,
                'push' => $profile['notify_push'] ?? true,
                'discussion' => $profile['notify_discussion'] ?? true,
                'reflection' => $profile['notify_reflection'] ?? true,
                'announcement' => $profile['notify_announcement'] ?? true,
            ],
        ];

        return Inertia::render('settings/index', [
            'profile' => [
                'name' => $user['name'] ?? '',
                'email' => $user['email'] ?? '',
                'role' => $user['role'] ?? '',
                'avatar' => $user['avatar'] ?? null,
            ],
            'preferences' => $preferences,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . '/api/users/me', $validated);
            if ($response->successful()) {
                $userData = (array) $response->json('data', []);
                $currentUser = (array) session('user', []);
                session(['user' => array_merge($currentUser, $userData)]);
                return response()->json(['message' => 'Profil berhasil diperbarui', 'data' => $userData]);
            }
            return response()->json(['message' => 'Gagal memperbarui profil'], $response->status());
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to update profile', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to update profile', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . '/api/users/me/password', [
                'currentPassword' => $validated['current_password'],
                'newPassword' => $validated['password'],
            ]);
            if ($response->successful()) {
                return response()->json(['message' => 'Password berhasil diubah']);
            }
            return response()->json(['message' => 'Gagal mengubah password'], $response->status());
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to update password', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to update password', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme' => 'sometimes|string|in:light,dark,system',
            'language' => 'sometimes|string|in:id,en',
            'notifications' => 'sometimes|array',
            'notifications.email' => 'sometimes|boolean',
            'notifications.push' => 'sometimes|boolean',
            'notifications.discussion' => 'sometimes|boolean',
            'notifications.reflection' => 'sometimes|boolean',
            'notifications.announcement' => 'sometimes|boolean',
        ]);

        $payload = [];
        if (isset($validated['theme'])) $payload['theme_preference'] = $validated['theme'];
        if (isset($validated['language'])) $payload['language_preference'] = $validated['language'];
        if (isset($validated['notifications'])) {
            $payload['notify_email'] = $validated['notifications']['email'] ?? true;
            $payload['notify_push'] = $validated['notifications']['push'] ?? true;
            $payload['notify_discussion'] = $validated['notifications']['discussion'] ?? true;
            $payload['notify_reflection'] = $validated['notifications']['reflection'] ?? true;
            $payload['notify_announcement'] = $validated['notifications']['announcement'] ?? true;
        }

        try {
            $response = $this->apiRequest()->put($this->apiUrl() . '/api/users/me/preferences', $payload);
            if ($response->successful()) {
                return response()->json(['message' => 'Preferensi berhasil disimpan']);
            }
            return response()->json(['message' => 'Gagal menyimpan preferensi'], $response->status());
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to update preferences', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to update preferences', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string',
            'confirmation' => 'required|string|in:HAPUS AKUN SAYA',
        ]);

        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . '/api/users/me', [
                'password' => $validated['password'],
            ]);
            if ($response->successful()) {
                session()->flush();
                return response()->json(['message' => 'Akun berhasil dihapus', 'redirect' => '/']);
            }
            return response()->json(['message' => 'Gagal menghapus akun'], $response->status());
        } catch (ConnectionException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to delete account', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        } catch (RequestException $e) {
            \Illuminate\Support\Facades\Log::warning('Settings: failed to delete account', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }
}
