<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Support\Carbon;

class LoanController extends Controller
{
    public function index()
    {
        // Traemos los préstamos junto con los datos del libro asociado
        return response()->json(Loan::with('book')->latest()->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id'    => 'required|exists:books,id',
            'user_name'  => 'required|string|max:255',
            'user_email' => 'required|email|max:255',
            'due_date'   => 'required|date|after_or_equal:today',
        ]);

        $book = Book::findOrFail($validated['book_id']);

        // Verificar si el libro está disponible
        if (!$book->is_available) {
            return response()->json([
                'message' => 'El libro seleccionado no se encuentra disponible actualmente.'
            ], 400);
        }

        // Crear préstamo
        $loan = Loan::create([
            'book_id'    => $book->id,
            'user_name'  => $validated['user_name'],
            'user_email' => $validated['user_email'],
            'loan_date'  => Carbon::now()->toDateString(),
            'due_date'   => $validated['due_date'],
            'status'     => 'ACTIVE',
        ]);

        // Cambiar estado del libro a no disponible
        $book->update(['is_available' => false]);

        return response()->json([
            'message' => 'Préstamo registrado exitosamente',
            'data'    => $loan->load('book')
        ], 201);
    }

    public function returnBook($id)
    {
        $loan = Loan::findOrFail($id);

        if ($loan->status === 'RETURNED') {
            return response()->json([
                'message' => 'Este préstamo ya fue devuelto con anterioridad.'
            ], 400);
        }

        // Registrar devolución y liberar el libro
        $loan->update([
            'return_date' => Carbon::now()->toDateString(),
            'status'      => 'RETURNED',
        ]);

        $loan->book->update(['is_available' => true]);

        return response()->json([
            'message' => 'Libro devuelto exitosamente',
            'data'    => $loan
        ], 200);
    }
}
