<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Models\Book;

class BookController extends Controller
{
    public function index()
    {
        return response()->json(Book::latest()->get(), 200);
    }

    public function store(StoreBookRequest $request)
    {
        $book = Book::create($request->validated());

        return response()->json([
            'message' => 'Libro creado exitosamente',
            'data' => $book
        ], 201);
    }

    public function show(Book $book)
    {
        return response()->json($book, 200);
    }

    public function update(UpdateBookRequest $request, Book $book)
    {
        $book->update($request->validated());

        return response()->json([
            'message' => 'Libro actualizado exitosamente',
            'data' => $book
        ], 200);
    }

    public function destroy(Book $book)
    {
        if (! $book->is_available) {
            throw new BusinessRuleException('No se puede eliminar un libro que está prestado.');
        }

        // Se conserva el historial: un libro con préstamos registrados no se elimina
        if ($book->loans()->exists()) {
            throw new BusinessRuleException('No se puede eliminar un libro con historial de préstamos.');
        }

        $book->delete();

        return response()->json([
            'message' => 'Libro eliminado correctamente'
        ], 200);
    }
}
