<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    public function showNotice(Request $request): Response
    {
        return Inertia::render('auth/verify-email', [
            'email' => $request->session()->get('email', ''),
            'success' => $request->session()->get('success'),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        try {
            $response = $this->coreApiRequest()->post(
                $this->apiUrl() . '/api/auth/verify-email',
                [
                    'token' => $request->input('token'),
                    'email' => $request->input('email'),
                ]
            );

            if ($response->successful()) {
                return redirect()->route('auth.login.index')
                    ->with('success', 'Email berhasil diverifikasi! Silakan masuk.');
            }

            if ($response->status() === 422) {
                return redirect()->route('auth.verify-email.notice')
                    ->with('email', $request->input('email'))
                    ->withErrors(['email' => 'Link verifikasi sudah tidak berlaku atau sudah digunakan.']);
            }

            return redirect()->route('auth.verify-email.notice')
                ->with('email', $request->input('email'))
                ->withErrors(['email' => 'Gagal memverifikasi email. Silakan coba lagi.']);
        } catch (ConnectionException $e) {
            Log::error('Email verification failed', ['error' => $e->getMessage()]);

            return redirect()->route('auth.verify-email.notice')
                ->with('email', $request->input('email'))
                ->withErrors(['email' => 'Tidak dapat terhubung ke layanan autentikasi.']);
        } catch (RequestException $e) {
            Log::error('Email verification failed', ['error' => $e->getMessage()]);

            return redirect()->route('auth.verify-email.notice')
                ->with('email', $request->input('email'))
                ->withErrors(['email' => 'Tidak dapat terhubung ke layanan autentikasi.']);
        }
    }

    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $response = $this->coreApiRequest()->post(
                $this->apiUrl() . '/api/auth/verify-email/resend',
                ['email' => $request->input('email')]
            );

            if ($response->successful()) {
                return back()->with('success', 'Email verifikasi telah dikirim ulang. Silakan periksa kotak masuk Anda.');
            }

            if ($response->status() === 429) {
                return back()->withErrors(['email' => 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.']);
            }

            return back()->withErrors(['email' => $response->json('error.message', 'Gagal mengirim ulang email verifikasi.')]);
        } catch (ConnectionException $e) {
            Log::error('Verification resend failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['email' => 'Tidak dapat terhubung ke layanan autentikasi.']);
        } catch (RequestException $e) {
            Log::error('Verification resend failed', ['error' => $e->getMessage()]);
            return back()->withErrors(['email' => 'Tidak dapat terhubung ke layanan autentikasi.']);
        }
    }
}
