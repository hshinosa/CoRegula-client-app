<?php

namespace App\Http\Controllers;

use App\Models\UserPreference;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle(): \Symfony\Component\HttpFoundation\RedirectResponse
    {
        $clientId = config('services.google.client_id');
        $redirectUri = urlencode(route('auth.google.callback'));
        $scope = urlencode('openid email profile');
        $state = csrf_token();

        session(['google_oauth_state' => $state]);

        $googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?"
            . "client_id={$clientId}"
            . "&redirect_uri={$redirectUri}"
            . "&response_type=code"
            . "&scope={$scope}"
            . "&state={$state}"
            . "&access_type=offline"
            . "&prompt=consent";

        return redirect($googleAuthUrl);
    }

    public function handleCallback(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        $savedState = session('google_oauth_state');
        if (!$savedState || $savedState !== $request->input('state')) {
            return redirect()->route('auth.login.index')->withErrors([
                'email' => 'Sesi Google OAuth tidak valid. Silakan coba lagi.',
            ]);
        }

        try {
            $tokenResponse = $this->coreApiRequest()->post(
                $this->apiUrl() . '/api/auth/google',
                ['code' => $request->input('code')]
            );

            if ($tokenResponse->successful()) {
                $data = $tokenResponse->json('data');

                session([
                    'jwt' => $data['accessToken'],
                    'refresh_token' => $data['refreshToken'],
                    'user' => $data['user'],
                ]);

                UserPreference::firstOrCreate(
                    ['user_id' => $data['user']['id']],
                    UserPreference::defaultsFor($data['user']['id'])
                );

                $redirectRoute = $data['user']['role'] === 'admin'
                    ? 'admin.dashboard'
                    : ($data['user']['role'] === 'lecturer'
                        ? 'dashboard'
                        : 'student.courses.index');

                return redirect()->route($redirectRoute)->with('success', 'Berhasil masuk dengan Google!');
            }

            if ($tokenResponse->status() === 422) {
                return redirect()->route('auth.login.index')->withErrors([
                    'email' => $tokenResponse->json('error.message', 'Akun Google tidak dapat diverifikasi.'),
                ]);
            }

            return redirect()->route('auth.login.index')->withErrors([
                'email' => 'Gagal masuk dengan Google. Silakan coba lagi.',
            ]);
        } catch (ConnectionException $e) {
            Log::error('Google OAuth failed', ['error' => $e->getMessage()]);

            return redirect()->route('auth.login.index')->withErrors([
                'email' => 'Tidak dapat terhubung ke layanan autentikasi.',
            ]);
        } catch (RequestException $e) {
            Log::error('Google OAuth failed', ['error' => $e->getMessage()]);

            return redirect()->route('auth.login.index')->withErrors([
                'email' => 'Tidak dapat terhubung ke layanan autentikasi.',
            ]);
        }
    }
}
