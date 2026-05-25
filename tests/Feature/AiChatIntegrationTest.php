<?php

namespace Tests\Feature;

use App\Models\ChatBookmark;
use App\Models\PromptTemplate;
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

    // ─── 4.6: Template → auto-fill → send message ───

    public function test_template_crud_flow(): void
    {
        $storeResponse = $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.templates.store'), [
                'title' => 'Ringkas Materi',
                'description' => 'Template untuk merangkum materi kuliah',
                'prompt_body' => 'Tolong ringkas materi berikut dan jelaskan poin pentingnya:',
                'category' => 'Akademik',
            ]);

        $storeResponse->assertCreated();
        $storeResponse->assertJsonPath('data.title', 'Ringkas Materi');
        $templateId = $storeResponse->json('data.id');

        $this->assertDatabaseHas('prompt_templates', [
            'title' => 'Ringkas Materi',
            'user_id' => 'user-1',
            'is_global' => false,
        ]);

        $indexResponse = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.templates.index'));

        $indexResponse->assertOk();
        $this->assertGreaterThanOrEqual(1, count($indexResponse->json('data')));

        $updateResponse = $this
            ->withSession($this->sessionData)
            ->putJson(route('student.ai-chat.templates.update', $templateId), [
                'title' => 'Ringkas Materi Kuliah',
                'prompt_body' => 'Tolong ringkas materi berikut secara detail:',
                'category' => 'Akademik',
            ]);

        $updateResponse->assertOk();
        $updateResponse->assertJsonPath('data.title', 'Ringkas Materi Kuliah');

        $deleteResponse = $this
            ->withSession($this->sessionData)
            ->deleteJson(route('student.ai-chat.templates.destroy', $templateId));

        $deleteResponse->assertOk();
        $this->assertDatabaseMissing('prompt_templates', ['id' => $templateId]);
    }

    public function test_template_max_50_personal_limit(): void
    {
        for ($i = 0; $i < 50; $i++) {
            PromptTemplate::create([
                'user_id' => 'user-1',
                'title' => "Template {$i}",
                'prompt_body' => "Prompt body {$i}",
                'is_global' => false,
            ]);
        }

        $response = $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.templates.store'), [
                'title' => 'Template 51',
                'prompt_body' => 'Should fail',
            ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'Anda telah mencapai batas maksimal 50 template personal.']);
    }

    public function test_template_categories_endpoint(): void
    {
        PromptTemplate::create([
            'user_id' => 'user-1',
            'title' => 'T1',
            'prompt_body' => 'P1',
            'category' => 'Akademik',
            'is_global' => false,
        ]);

        PromptTemplate::create([
            'user_id' => 'user-1',
            'title' => 'T2',
            'prompt_body' => 'P2',
            'category' => 'Penelitian',
            'is_global' => false,
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.templates.categories'));

        $response->assertOk();
        $categories = $response->json('data');
        $this->assertContains('Akademik', $categories);
        $this->assertContains('Penelitian', $categories);
    }

    // ─── 4.7: Bookmark → panel → navigate to message ───

    public function test_bookmark_toggle_and_panel_flow(): void
    {
        $toggleResponse = $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.bookmarks.toggle'), [
                'message_id' => 'msg-abc',
                'conversation_id' => 'chat-100',
            ]);

        $toggleResponse->assertCreated();
        $toggleResponse->assertJsonPath('bookmarked', true);
        $this->assertDatabaseHas('chat_bookmarks', [
            'user_id' => 'user-1',
            'message_id' => 'msg-abc',
        ]);

        $panelResponse = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.bookmarks.index'));

        $panelResponse->assertOk();
        $this->assertGreaterThanOrEqual(1, count($panelResponse->json('data')));

        $bookmarkId = $panelResponse->json('data.0.id');

        $deleteResponse = $this
            ->withSession($this->sessionData)
            ->deleteJson(route('student.ai-chat.bookmarks.destroy', $bookmarkId));

        $deleteResponse->assertOk();
        $this->assertDatabaseMissing('chat_bookmarks', ['id' => $bookmarkId]);
    }

    public function test_bookmark_check_returns_bookmarked_message_ids(): void
    {
        ChatBookmark::create([
            'user_id' => 'user-1',
            'message_id' => 'msg-001',
            'conversation_id' => 'chat-100',
        ]);

        ChatBookmark::create([
            'user_id' => 'user-1',
            'message_id' => 'msg-003',
            'conversation_id' => 'chat-100',
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.bookmarks.check'), [
                'message_ids' => ['msg-001', 'msg-002', 'msg-003'],
            ]);

        $response->assertOk();
        $bookmarked = $response->json('data');
        $this->assertContains('msg-001', $bookmarked);
        $this->assertContains('msg-003', $bookmarked);
        $this->assertNotContains('msg-002', $bookmarked);
    }

    public function test_bookmark_unique_constraint_prevents_duplicates(): void
    {
        $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.bookmarks.store'), [
                'message_id' => 'msg-dup',
                'conversation_id' => 'chat-100',
            ])
            ->assertCreated();

        $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.bookmarks.store'), [
                'message_id' => 'msg-dup',
                'conversation_id' => 'chat-100',
            ])
            ->assertStatus(409);
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

    public function test_search_returns_empty_for_short_query_without_bookmark(): void
    {
        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.search') . '?q=a');

        $response->assertOk();
        $response->assertJson(['data' => []]);
    }

    // ─── 4.9: Bookmark on deleted message ───

    public function test_bookmark_toggle_on_already_bookmarked_message_removes_it(): void
    {
        ChatBookmark::create([
            'user_id' => 'user-1',
            'message_id' => 'msg-deleted',
            'conversation_id' => 'chat-200',
        ]);

        $this->assertDatabaseHas('chat_bookmarks', [
            'user_id' => 'user-1',
            'message_id' => 'msg-deleted',
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->postJson(route('student.ai-chat.bookmarks.toggle'), [
                'message_id' => 'msg-deleted',
                'conversation_id' => 'chat-200',
            ]);

        $response->assertOk();
        $response->assertJsonPath('bookmarked', false);
        $this->assertDatabaseMissing('chat_bookmarks', [
            'user_id' => 'user-1',
            'message_id' => 'msg-deleted',
        ]);
    }

    public function test_bookmark_panel_handles_deleted_message_gracefully(): void
    {
        ChatBookmark::create([
            'user_id' => 'user-1',
            'message_id' => 'msg-gone',
            'conversation_id' => 'chat-300',
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.bookmarks.index'));

        $response->assertOk();
        $bookmarks = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($bookmarks));
        $this->assertEquals('msg-gone', $bookmarks[0]['message_id']);
    }

    public function test_bookmark_destroy_requires_ownership(): void
    {
        $bookmark = ChatBookmark::create([
            'user_id' => 'other-user',
            'message_id' => 'msg-other',
            'conversation_id' => 'chat-400',
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->deleteJson(route('student.ai-chat.bookmarks.destroy', $bookmark));

        $response->assertStatus(403);
    }

    public function test_template_update_requires_ownership(): void
    {
        $template = PromptTemplate::create([
            'user_id' => 'other-user',
            'title' => 'Not mine',
            'prompt_body' => 'Body',
            'is_global' => false,
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->putJson(route('student.ai-chat.templates.update', $template), [
                'title' => 'Hacked',
                'prompt_body' => 'Changed',
            ]);

        $response->assertStatus(403);
    }

    public function test_template_destroy_requires_ownership(): void
    {
        $template = PromptTemplate::create([
            'user_id' => 'other-user',
            'title' => 'Not mine',
            'prompt_body' => 'Body',
            'is_global' => false,
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->deleteJson(route('student.ai-chat.templates.destroy', $template));

        $response->assertStatus(403);
    }

    public function test_global_templates_visible_to_all_users(): void
    {
        PromptTemplate::create([
            'user_id' => null,
            'title' => 'Global Template',
            'prompt_body' => 'Global prompt body',
            'is_global' => true,
            'category' => 'Umum',
        ]);

        $response = $this
            ->withSession($this->sessionData)
            ->getJson(route('student.ai-chat.templates.index'));

        $response->assertOk();
        $templates = collect($response->json('data'));
        $this->assertTrue($templates->contains('title', 'Global Template'));
    }
}
