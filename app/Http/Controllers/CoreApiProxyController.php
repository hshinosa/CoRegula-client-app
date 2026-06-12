<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoreApiProxyController extends Controller
{
    public function privacyPolicy(): JsonResponse
    {
        try {
            $response = $this->coreApiRequest()->get($this->apiUrl() . '/api/privacy/policy');
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal memuat kebijakan privasi'], 502);
        }
    }

    public function privacyPreferencesGet(): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/user/privacy-preferences');
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal memuat preferensi privasi'], 502);
        }
    }

    public function privacyPreferencesPut(Request $request): JsonResponse
    {
        try {
            $response = $this->apiRequest()->put(
                $this->apiUrl() . '/api/user/privacy-preferences',
                $request->only(['analyticsVisibility', 'aiInteractionConsent', 'dataSharingConsent'])
            );
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal menyimpan preferensi privasi'], 502);
        }
    }

    public function retentionPoliciesIndex(): JsonResponse
    {
        try {
            $response = $this->apiRequest()->get($this->apiUrl() . '/api/admin/retention-policies');
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal memuat kebijakan retensi'], 502);
        }
    }

    public function retentionPoliciesUpdate(Request $request, string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->put(
                $this->apiUrl() . '/api/admin/retention-policies/' . $id,
                $request->only(['retentionDays', 'archiveAfterDays', 'autoPurge'])
            );
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal menyimpan kebijakan retensi'], 502);
        }
    }

    public function retentionPoliciesDestroy(string $id): JsonResponse
    {
        try {
            $response = $this->apiRequest()->delete($this->apiUrl() . '/api/admin/retention-policies/' . $id);
            return $this->proxyResponse($response);
        } catch (ConnectionException|RequestException $e) {
            return response()->json(['message' => 'Gagal menghapus kebijakan retensi'], 502);
        }
    }

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