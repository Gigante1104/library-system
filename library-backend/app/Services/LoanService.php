<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Book;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

/**
 * Reglas de negocio de los préstamos.
 * El controlador solo recibe la petición y delega aquí la lógica.
 */
class LoanService
{
    public const MAX_ACTIVE_LOANS = 3;
    public const MAX_LOAN_DAYS = 30;

    /**
     * @throws BusinessRuleException
     */
    public function create(int $bookId, int $memberId, string $dueDate): Loan
    {
        // transaction: si algo falla, se deshacen todos los cambios (no queda un préstamo sin bloquear el libro)
        return DB::transaction(function () use ($bookId, $memberId, $dueDate) {
            // lockForUpdate: bloquea la fila del libro hasta terminar la transacción,
            // así dos peticiones simultáneas no pueden prestar el mismo libro
            $book = Book::lockForUpdate()->findOrFail($bookId);
            $member = Member::findOrFail($memberId);

            if (! $book->is_available) {
                throw new BusinessRuleException('El libro seleccionado no se encuentra disponible actualmente.');
            }

            if ($member->loans()->overdue()->exists()) {
                throw new BusinessRuleException('El lector tiene préstamos vencidos. Debe devolverlos antes de solicitar otro.');
            }

            if ($member->loans()->active()->count() >= self::MAX_ACTIVE_LOANS) {
                throw new BusinessRuleException('El lector alcanzó el máximo de ' . self::MAX_ACTIVE_LOANS . ' préstamos activos.');
            }

            $loan = Loan::create([
                'book_id'   => $book->id,
                'member_id' => $member->id,
                'loan_date' => today()->toDateString(),
                'due_date'  => $dueDate,
                'status'    => Loan::STATUS_ACTIVE,
            ]);

            $book->update(['is_available' => false]);

            return $loan->load(['book', 'member']);
        });
    }

    /**
     * @throws BusinessRuleException
     */
    public function returnBook(Loan $loan): Loan
    {
        return DB::transaction(function () use ($loan) {
            // Se vuelve a leer con bloqueo para evitar dos devoluciones simultáneas
            $loan = Loan::lockForUpdate()->findOrFail($loan->id);

            if ($loan->status === Loan::STATUS_RETURNED) {
                throw new BusinessRuleException('Este préstamo ya fue devuelto con anterioridad.');
            }

            $loan->update([
                'return_date' => today()->toDateString(),
                'status'      => Loan::STATUS_RETURNED,
            ]);

            $loan->book->update(['is_available' => true]);

            return $loan->load(['book', 'member']);
        });
    }
}
