<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RememberMeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (session('remember_me') && session('jwt')) {
            $response->headers->setCookie(
                cookie(
                    config('session.cookie'),
                    session()->getId(),
                    43200,
                    '/',
                    null,
                    config('session.secure'),
                    true
                )
            );
        }

        return $response;
    }
}
