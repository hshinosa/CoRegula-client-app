<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;

class CoreApiProxyController extends Controller
{
    public function discussionHealth(): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/lecturer/discussion-health');
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal memuat kesehatan diskusi'], 502);
        }
    }
}