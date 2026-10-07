<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookApiTest extends TestCase
{
    // Reinicia la base de datos (SQLite en memoria) antes de cada prueba
    use RefreshDatabase;

    public function test_it_lists_books(): void
    {
        // Arrange
        Book::factory()->count(3)->create();

        // Act
        $response = $this->getJson('/api/books');

        // Assert
        $response->assertOk()->assertJsonCount(3);
    }

    public function test_it_creates_a_book_available_by_default(): void
    {
        $response = $this->postJson('/api/books', [
            'title'  => 'Cien años de soledad',
            'author' => 'Gabriel García Márquez',
            'genre'  => 'Novela',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Cien años de soledad')
            ->assertJsonPath('data.is_available', true);

        $this->assertDatabaseHas('books', ['title' => 'Cien años de soledad']);
    }

    public function test_it_validates_required_fields_when_creating(): void
    {
        $response = $this->postJson('/api/books', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'author', 'genre']);
    }

    public function test_it_lists_the_genre_catalog(): void
    {
        $this->getJson('/api/genres')
            ->assertOk()
            ->assertJson(Book::GENRES);
    }

    public function test_genre_must_belong_to_the_catalog(): void
    {
        $response = $this->postJson('/api/books', [
            'title'  => 'Libro',
            'author' => 'Autor',
            'genre'  => 'novelas',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('errors.genre.0', 'El género seleccionado no es válido.');
    }

    public function test_it_updates_a_book(): void
    {
        $book = Book::factory()->create(['title' => 'Título viejo']);

        $response = $this->putJson("/api/books/{$book->id}", ['title' => 'Título nuevo']);

        $response->assertOk()->assertJsonPath('data.title', 'Título nuevo');
    }

    public function test_availability_cannot_be_changed_manually(): void
    {
        $book = Book::factory()->unavailable()->create();

        $this->putJson("/api/books/{$book->id}", ['is_available' => true])->assertOk();

        $this->assertFalse($book->fresh()->is_available);
    }

    public function test_it_deletes_a_book_without_loans(): void
    {
        $book = Book::factory()->create();

        $this->deleteJson("/api/books/{$book->id}")->assertOk();

        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    public function test_it_cannot_delete_a_borrowed_book(): void
    {
        $loan = Loan::factory()->create();

        $this->deleteJson("/api/books/{$loan->book_id}")->assertConflict();

        $this->assertDatabaseHas('books', ['id' => $loan->book_id]);
    }

    public function test_it_cannot_delete_a_book_with_loan_history(): void
    {
        $loan = Loan::factory()->returned()->create();

        $this->deleteJson("/api/books/{$loan->book_id}")->assertConflict();
    }

    public function test_it_returns_404_for_a_missing_book(): void
    {
        $this->getJson('/api/books/999')
            ->assertNotFound()
            ->assertJson(['message' => 'Recurso no encontrado.']);
    }
}
