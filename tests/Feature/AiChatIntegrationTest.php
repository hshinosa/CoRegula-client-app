<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiChatIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private array $sessionData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sessionData = $this->studentSessionData();
    }

    // ─── 4.5: Search → click result → navigate to session ───

    public function test_search_returns_results_with_proper_structure(): void
    {
        Http::fake([
            'http://localhost:3000/api/ai-chats/search*' => Http::response([
                'data' => [
                    [
                        'id' => 'chat-100',
                        'title' => 'Diskusi Algoritma',
                        'created_at' => '2026-05-20T10:00:00.000Z',
                        'updated_at' => '2026-05-20T10:30:00.000Z',
                        'snippet' => 'Penjelasan tentang algoritma sorting...',
                        'match_type' => 'content',
                    ],
                ],
                'next_cursor' => null,
            ], 200),
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.search') . '?q=algoritma');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'created_at', 'updated_at', 'snippet', 'match_type'],
            ],
        ]);
        $response->assertJsonPath('data.0.id', 'chat-100');
        $response->assertJsonPath('data.0.title', 'Diskusi Algoritma');
    }

    public function test_search_navigates_to_session_via_show_route(): void
    {
        Http::fake([
            'http://localhost:3000/api/ai-chats' => Http::response([
                'data' => [
                    [
                        'id' => 'chat-100',
                        'title' => 'Diskusi Algoritma',
                        'createdAt' => '2026-05-20T10:00:00.000Z',
                        'updatedAt' => '2026-05-20T10:30:00.000Z',
                    ],
                ],
            ], 200),
            'http://localhost:3000/api/ai-chats/chat-100' => Http::response([
                'data' => [
                    'id' => 'chat-100',
                    'title' => 'Diskusi Algoritma',
                    'createdAt' => '2026-05-20T10:00:00.000Z',
                    'updatedAt' => '2026-05-20T10:30:00.000Z',
                    'messages' => [],
                ],
            ], 200),
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->get(route('student.ai-chat.show', 'chat-100'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('student/ai-chat/index')
            ->where('activeChat.id', 'chat-100')
        );
    }

    // ─── 4.8: Search with empty results ───

    public function test_search_returns_empty_for_no_matches(): void
    {
        Http::fake([
            'http://localhost:3000/api/ai-chats/search*' => Http::response([
                'data' => [],
                'next_cursor' => null,
            ], 200),
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.search') . '?q=xyznonexistentquery123');

        $response->assertOk();
        $response->assertJson(['data' => []]);
    }

    public function test_search_returns_empty_for_short_query(): void
    {
        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.search') . '?q=a');

        $response->assertOk();
        $response->assertJson(['data' => []]);
    }
}
