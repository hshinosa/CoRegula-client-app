<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ForgotPasswordController extends Controller
{
    public function showForgotPassword(): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    public function sendResetLink(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $response = $this->coreApiRequest()->post(
                $this->apiUrl() . '/api/auth/forgot-password',
                ['email' => $validated['email']]
            );

            if ($response->successful()) {
                return back()->with('success', 'Tautan reset sandi telah dikirim ke email Anda.');
            }

            // Even if email not found, show success to prevent email enumeration
            if ($response->status() === 404) {
                return back()->with('success', 'Jika email terdaftar, tautan reset sandi akan dikirim.');
            }

            return back()->withErrors([
                'email' => $response->json('error.message', 'Gagal mengirim tautan reset sandi.'),
            ]);
        } catch (ConnectionException $e) {
            Log::error('Forgot password failed', ['error' => $e->getMessage()]);

            return back()->withErrors([
                'email' => 'Tidak dapat terhubung ke layanan autentikasi. Silakan coba lagi.',
            ]);
        } catch (RequestException $e) {
            Log::error('Forgot password failed', ['error' => $e->getMessage()]);

            return back()->withErrors([
                'email' => 'Tidak dapat terhubung ke layanan autentikasi. Silakan coba lagi.',
            ]);
        }
    }

    public function showResetPassword(Request $request): Response
    {
        return Inertia::render('auth/reset-password', [
            'token' => $request->query('token', ''),
            'email' => $request->query('email', ''),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            $response = $this->coreApiRequest()->post(
                $this->apiUrl() . '/api/auth/reset-password',
                [
                    'token' => $validated['token'],
                    'email' => $validated['email'],
                    'password' => $validated['password'],
                    'password_confirmation' => $validated['password_confirmation'] ?? $validated['password'],
                ]
            );

            if ($response->successful()) {
                return redirect()->route('auth.login.index')->with('success', 'Sandi berhasil direset. Silakan masuk dengan sandi baru Anda.');
            }

            if ($response->status() === 422) {
                return back()->withErrors([
                    'email' => $response->json('error.message', 'Token reset tidak valid atau sudah kedaluwarsa.'),
                ]);
            }

            return back()->withErrors([
                'email' => $response->json('error.message', 'Gagal mereset sandi.'),
            ]);
        } catch (ConnectionException $e) {
            Log::error('Reset password failed', ['error' => $e->getMessage()]);

            return back()->withErrors([
                'email' => 'Tidak dapat terhubung ke layanan autentikasi. Silakan coba lagi.',
            ]);
        } catch (RequestException $e) {
            Log::error('Reset password failed', ['error' => $e->getMessage()]);

            return back()->withErrors([
                'email' => 'Tidak dapat terhubung ke layanan autentikasi. Silakan coba lagi.',
            ]);
        }
    }
}
