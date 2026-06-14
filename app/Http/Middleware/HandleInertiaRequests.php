<?php

namespace App\Http\Middleware;

use App\Models\UserAvatar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = session('user');
        $avatarUrls = null;

        if ($user && isset($user['id']) && Schema::hasTable('user_avatars')) {
            $avatar = UserAvatar::where('user_id', $user['id'])->first();
            if ($avatar) {
                $avatarUrls = $avatar->getUrls();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name', 'Kolabri'),
            'auth' => [
                'user' => $user,
                'avatar' => $avatarUrls,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
