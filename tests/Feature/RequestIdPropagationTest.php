<?php

namespace Tests\Feature;

use Ramsey\Uuid\Uuid;
use Tests\TestCase;

class RequestIdPropagationTest extends TestCase
{
    public function test_request_without_header_gets_new_uuid(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);

        $requestId = $response->headers->get('X-Request-ID');
        $this->assertNotNull($requestId);
        $this->assertTrue(Uuid::isValid($requestId), 'Generated request ID should be a valid UUID');
    }

    public function test_request_with_invalid_header_gets_new_uuid(): void
    {
        $invalidFormats = ['invalid', '123', 'not-a-uuid', ''];

        foreach ($invalidFormats as $invalidId) {
            $response = $this->withHeaders([
                'X-Request-ID' => $invalidId,
            ])->get('/');

            $response->assertStatus(200);

            $requestId = $response->headers->get('X-Request-ID');
            $this->assertNotNull($requestId);
            $this->assertTrue(
                Uuid::isValid($requestId),
                "Invalid format '{$invalidId}' should trigger new UUID generation"
            );
        }
    }

    public function test_request_with_valid_uuid_is_preserved(): void
    {
        $validUuid = (string) \Illuminate\Support\Str::uuid();

        $response = $this->withHeaders([
            'X-Request-ID' => $validUuid,
        ])->get('/');

        $response->assertStatus(200);

        $requestId = $response->headers->get('X-Request-ID');
        $this->assertSame($validUuid, $requestId, 'Valid UUID should be preserved');
    }

    public function test_request_id_is_in_response_headers(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $this->assertNotNull($response->headers->get('X-Request-ID'));
    }

    public function test_request_id_is_stored_in_request_attributes(): void
    {
        $validUuid = (string) \Illuminate\Support\Str::uuid();

        $capturedRequestId = null;

        app('router')->get('/test-request-id', function (\Illuminate\Http\Request $request) use (&$capturedRequestId) {
            $capturedRequestId = $request->attributes->get('request_id');
            return response('ok');
        });

        $response = $this->withHeaders([
            'X-Request-ID' => $validUuid,
        ])->get('/test-request-id');

        $response->assertStatus(200);
        $this->assertSame($validUuid, $capturedRequestId, 'request_id should be stored in request attributes');
    }

    public function test_new_uuid_is_stored_in_request_attributes_when_missing(): void
    {
        $capturedRequestId = null;

        app('router')->get('/test-request-id-new', function (\Illuminate\Http\Request $request) use (&$capturedRequestId) {
            $capturedRequestId = $request->attributes->get('request_id');
            return response('ok');
        });

        $response = $this->get('/test-request-id-new');

        $response->assertStatus(200);
        $this->assertNotNull($capturedRequestId);
        $this->assertTrue(Uuid::isValid($capturedRequestId), 'Generated request_id in attributes should be valid UUID');

        $responseId = $response->headers->get('X-Request-ID');
        $this->assertSame($responseId, $capturedRequestId, 'Response header and request attributes should match');
    }
}
