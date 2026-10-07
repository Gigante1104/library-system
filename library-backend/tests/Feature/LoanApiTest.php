<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Member;
use App\Services\LoanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanApiTest extends TestCase
{
    use RefreshDatabase;

    private function loanPayload(Book $book, Member $member, int $days = 7): array
    {
        return [
            'book_id'   => $book->id,
            'member_id' => $member->id,
            'due_date'  => today()->addDays($days)->toDateString(),
        ];
    }

    public function test_creating_a_loan_marks_the_book_as_unavailable(): void
    {
        $book = Book::factory()->create();
        $member = Member::factory()->create();

        $response = $this->postJson('/api/loans', $this->loanPayload($book, $member));

        $response->assertCreated()
            ->assertJsonPath('data.status', Loan::STATUS_ACTIVE)
            ->assertJsonPath('data.loan_date', today()->toDateString());

        $this->assertFalse($book->fresh()->is_available);
    }

    public function test_it_cannot_lend_an_unavailable_book(): void
    {
        $loan = Loan::factory()->create();
        $otherMember = Member::factory()->create();

        $response = $this->postJson('/api/loans', $this->loanPayload($loan->book, $otherMember));

        $response->assertConflict();
        $this->assertSame(1, Loan::count());
    }

    public function test_a_member_cannot_exceed_the_active_loan_limit(): void
    {
        $member = Member::factory()->create();
        Loan::factory()->count(LoanService::MAX_ACTIVE_LOANS)->for($member)->create();

        $response = $this->postJson('/api/loans', $this->loanPayload(Book::factory()->create(), $member));

        $response->assertConflict()->assertJsonFragment(['message' => 'El lector alcanzó el máximo de 3 préstamos activos.']);
    }

    public function test_a_member_with_overdue_loans_cannot_borrow(): void
    {
        $member = Member::factory()->create();
        Loan::factory()->overdue()->for($member)->create();

        $response = $this->postJson('/api/loans', $this->loanPayload(Book::factory()->create(), $member));

        $response->assertConflict();
    }

    public function test_due_date_cannot_exceed_the_maximum_loan_period(): void
    {
        $payload = $this->loanPayload(Book::factory()->create(), Member::factory()->create(), LoanService::MAX_LOAN_DAYS + 1);

        $this->postJson('/api/loans', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['due_date']);
    }

    public function test_returning_a_loan_frees_the_book(): void
    {
        $loan = Loan::factory()->create();

        $response = $this->postJson("/api/loans/{$loan->id}/return");

        $response->assertOk()
            ->assertJsonPath('data.status', Loan::STATUS_RETURNED)
            ->assertJsonPath('data.return_date', today()->toDateString());

        $this->assertTrue($loan->book->fresh()->is_available);
    }

    public function test_a_loan_cannot_be_returned_twice(): void
    {
        $loan = Loan::factory()->returned()->create();

        $this->postJson("/api/loans/{$loan->id}/return")->assertConflict();
    }
}
