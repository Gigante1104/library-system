<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Por defecto crea un préstamo ACTIVO dentro del plazo.
 * Usa los estados returned() y overdue() para los otros escenarios.
 *
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $loanDate = today()->subDays(fake()->numberBetween(0, 5));

        return [
            'book_id'     => Book::factory(),
            'member_id'   => Member::factory(),
            'loan_date'   => $loanDate,
            'due_date'    => $loanDate->copy()->addDays(14),
            'return_date' => null,
            'status'      => Loan::STATUS_ACTIVE,
        ];
    }

    /**
     * Igual que hace LoanService: un préstamo activo deja el libro no disponible.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Loan $loan) {
            if ($loan->status === Loan::STATUS_ACTIVE) {
                $loan->book->update(['is_available' => false]);
            }
        });
    }

    /**
     * Préstamo ya devuelto.
     */
    public function returned(): static
    {
        return $this->state(function () {
            $loanDate = today()->subDays(fake()->numberBetween(20, 170));

            return [
                'loan_date'   => $loanDate,
                'due_date'    => $loanDate->copy()->addDays(14),
                'return_date' => $loanDate->copy()->addDays(fake()->numberBetween(3, 18)),
                'status'      => Loan::STATUS_RETURNED,
            ];
        });
    }

    /**
     * Préstamo activo cuya fecha límite ya pasó.
     */
    public function overdue(): static
    {
        return $this->state(function () {
            $loanDate = today()->subDays(fake()->numberBetween(20, 30));

            return [
                'loan_date' => $loanDate,
                'due_date'  => $loanDate->copy()->addDays(14),
            ];
        });
    }
}
