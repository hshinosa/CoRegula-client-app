<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserMassAssignmentSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_is_not_mass_assignable(): void
    {
        $user = User::create([
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'password' => 'should-not-be-set',
        ]);

        $this->assertNull($user->password);
    }

    public function test_factory_still_creates_user_with_password(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->password);
    }
}
