<?php

namespace Tests\Feature;

use Tests\TestCase;

class LoginPageAssetSchemeTest extends TestCase
{
    public function test_login_page_does_not_force_https_assets_for_local_requests(): void
    {
        $response = $this
            ->withServerVariables([
                'HTTPS' => 'off',
                'HTTP_HOST' => '127.0.0.1:8000',
                'HTTP_X_FORWARDED_PROTO' => 'https',
            ])
            ->get('/login');

        $response->assertOk();
        $response->assertSee('/build/assets/app-', false);
        $response->assertDontSee('https://127.0.0.1:8000/build/assets', false);
        $response->assertDontSee('https://localhost/build/assets', false);
    }
}
