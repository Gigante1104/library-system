<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLoanRequest;
use App\Models\Loan;
use App\Services\LoanService;

class LoanController extends Controller
{
    // Inyección de dependencias: Laravel crea el LoanService automáticamente
    public function __construct(private LoanService $loanService)
    {
    }

    public function index()
    {
        // Traemos los préstamos junto con los datos del libro y del lector asociados
        return response()->json(Loan::with(['book', 'member'])->latest()->get(), 200);
    }

    public function store(StoreLoanRequest $request)
    {
        // Si la validación falla, Laravel responde 422 antes de llegar aquí
        $validated = $request->validated();

        $loan = $this->loanService->create(
            $validated['book_id'],
            $validated['member_id'],
            $validated['due_date'],
        );

        return response()->json([
            'message' => 'Préstamo registrado exitosamente',
            'data'    => $loan
        ], 201);
    }

    public function returnBook(Loan $loan)
    {
        $loan = $this->loanService->returnBook($loan);

        return response()->json([
            'message' => 'Libro devuelto exitosamente',
            'data'    => $loan
        ], 200);
    }
}
