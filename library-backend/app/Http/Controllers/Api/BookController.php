<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Book;

class BookController extends Controller
{
    public function index()
    {
        return response()->json(Book::latest()->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'  => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'genre'  => 'required|string|max:100',
        ]);

        $book = Book::create($validated);

        return response()->json([
            'message' => 'Libro creado exitosamente',
            'data' => $book
        ], 201);
    }

    public function show(Book $book)
    {
        return response()->json($book, 200);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'author'       => 'sometimes|required|string|max:255',
            'genre'        => 'sometimes|required|string|max:100',
        ]);

        $book->update($validated);

        return response()->json([
            'message' => 'Libro actualizado exitosamente',
            'data' => $book
        ], 200);
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json([
            'message' => 'Libro eliminado correctamente'
        ], 200);
    }
}
