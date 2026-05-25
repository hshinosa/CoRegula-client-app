<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function createFakeJwt(array $payload = []): string
    {
        $header = base64_encode(json_encode(['alg' => 'none', 'typ' => 'JWT']));
        $defaultPayload = [
            'sub' => 'user-1',
            'exp' => time() + 3600,
            'iat' => time(),
        ];
        $body = base64_encode(json_encode(array_merge($defaultPayload, $payload)));
        $signature = base64_encode('fake-signature');

        return "{$header}.{$body}.{$signature}";
    }

    protected function studentSessionData(?string $userId = 'user-1'): array
    {
        return [
            'jwt' => $this->createFakeJwt(['sub' => $userId]),
            'user' => [
                'id' => $userId,
                'name' => 'QA Student',
                'email' => 'qa@example.com',
                'role' => 'student',
            ],
        ];
    }
}
