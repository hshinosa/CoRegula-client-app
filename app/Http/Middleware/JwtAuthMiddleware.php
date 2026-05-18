<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthMiddleware
{
    private function decodeJwtPayload(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) < 2) {
            return null;
        }

        $payload = $parts[1];
        $payload .= str_repeat('=', (4 - strlen($payload) % 4) % 4);
        $decoded = base64_decode(strtr($payload, '-_', '+/'), true);

        if ($decoded === false) {
            return null;
        }

        $data = json_decode($decoded, true);

        return is_array($data) ? $data : null;
    }

    /**
     * Handle an incoming request.
     * Checks if user has valid JWT session.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!session('jwt') || !session('user')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            
            return redirect()->route('auth.login.index')->with('error', 'Please login to continue');
        }

        $payload = $this->decodeJwtPayload((string) session('jwt'));
        $exp = is_array($payload) && isset($payload['exp']) ? (int) $payload['exp'] : null;

        if (!is_array($payload) || $exp === null || !is_numeric($payload['exp']) || $exp <= time()) {
            session()->forget(['jwt', 'refresh_token', 'user']);

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Session expired or invalid token'], 401);
            }

            return redirect()->route('auth.login.index')->with('error', 'Session expired');
        }

        // Share user data with all views
        $request->merge(['auth_user' => session('user')]);

        return $next($request);
    }
}
