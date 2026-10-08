<?php

namespace Tests\Unit;

use App\Models\Loan;
use Tests\TestCase;

/**
 * Pruebas unitarias del cálculo de vencimiento (Loan::isOverdue).
 * No usan base de datos: se construye el modelo en memoria con new Loan().
 */
class LoanTest extends TestCase
{
    public function test_an_active_loan_past_its_due_date_is_overdue(): void
    {
        $loan = new Loan([
            'status'   => Loan::STATUS_ACTIVE,
            'due_date' => today()->subDay(),
        ]);

        $this->assertTrue($loan->is_overdue);
    }

    public function test_an_active_loan_due_today_is_not_overdue(): void
    {
        $loan = new Loan([
            'status'   => Loan::STATUS_ACTIVE,
            'due_date' => today(),
        ]);

        $this->assertFalse($loan->is_overdue);
    }

    public function test_a_returned_loan_is_never_overdue(): void
    {
        $loan = new Loan([
            'status'   => Loan::STATUS_RETURNED,
            'due_date' => today()->subDays(5),
        ]);

        $this->assertFalse($loan->is_overdue);
    }
}
