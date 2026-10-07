<?php

namespace Tests\Feature;

use App\Models\Loan;
use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_member(): void
    {
        $response = $this->postJson('/api/members', [
            'name'  => 'Ana Pérez',
            'email' => 'ana@example.com',
        ]);

        $response->assertCreated()->assertJsonPath('data.email', 'ana@example.com');
    }

    public function test_email_must_be_unique(): void
    {
        Member::factory()->create(['email' => 'ana@example.com']);

        $response = $this->postJson('/api/members', [
            'name'  => 'Otra Ana',
            'email' => 'ana@example.com',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_a_member_can_keep_their_own_email_when_updating(): void
    {
        $member = Member::factory()->create(['email' => 'ana@example.com']);

        $response = $this->putJson("/api/members/{$member->id}", [
            'name'  => 'Ana María Pérez',
            'email' => 'ana@example.com',
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'Ana María Pérez');
    }

    public function test_it_cannot_delete_a_member_with_loans(): void
    {
        $loan = Loan::factory()->returned()->create();

        $this->deleteJson("/api/members/{$loan->member_id}")->assertConflict();

        $this->assertDatabaseHas('members', ['id' => $loan->member_id]);
    }
}
