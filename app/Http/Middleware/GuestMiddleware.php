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
            
            // Redirect to appropriate dashboard
            if ($user['role'] === 'lecturer') {
                return redirect()->route('lecturer.courses.index');
            }
            
            return redirect()->route('student.courses.index');
        }

        return $next($request);
    }
}
