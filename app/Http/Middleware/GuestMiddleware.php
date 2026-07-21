<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GuestMiddleware
{
    /**
     * Handle an incoming request.
     * Redirects authenticated users away from guest pages.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (session('jwt') && session('user')) {
            $user = session('user');
            
            // Redirect to appropriate home for authenticated guests
            if ($user['role'] === 'admin') {
                return redirect()->route('admin.dashboard');
            }

            if ($user['role'] === 'lecturer') {
                return redirect()->route('dashboard');
            }

            return redirect()->route('student.courses.index');
        }

        return $next($request);
    }
}
