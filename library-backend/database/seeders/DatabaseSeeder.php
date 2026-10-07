<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    private const BOOKS = [
        ['Cien años de soledad', 'Gabriel García Márquez', 'Novela'],
        ['El amor en los tiempos del cólera', 'Gabriel García Márquez', 'Novela'],
        ['La vorágine', 'José Eustasio Rivera', 'Novela'],
        ['María', 'Jorge Isaacs', 'Novela'],
        ['Rayuela', 'Julio Cortázar', 'Novela'],
        ['Don Quijote de la Mancha', 'Miguel de Cervantes', 'Novela'],
        ['1984', 'George Orwell', 'Ciencia ficción'],
        ['Fahrenheit 451', 'Ray Bradbury', 'Ciencia ficción'],
        ['Dune', 'Frank Herbert', 'Ciencia ficción'],
        ['Fundación', 'Isaac Asimov', 'Ciencia ficción'],
        ['El señor de los anillos', 'J. R. R. Tolkien', 'Fantasía'],
        ['Harry Potter y la piedra filosofal', 'J. K. Rowling', 'Fantasía'],
        ['El nombre del viento', 'Patrick Rothfuss', 'Fantasía'],
        ['Sapiens', 'Yuval Noah Harari', 'Historia'],
        ['Las venas abiertas de América Latina', 'Eduardo Galeano', 'Historia'],
        ['Breve historia del tiempo', 'Stephen Hawking', 'Ciencia'],
        ['Cosmos', 'Carl Sagan', 'Ciencia'],
        ['Veinte poemas de amor', 'Pablo Neruda', 'Poesía'],
        ['El principito', 'Antoine de Saint-Exupéry', 'Infantil'],
        ['Matilda', 'Roald Dahl', 'Infantil'],
    ];

    /**
     * Seed the application's database.
     *
     * Escenario de demo: historial de préstamos de ~6 meses,
     * algunos préstamos activos y algunos vencidos.
     */
    public function run(): void
    {
        $books = collect(self::BOOKS)->map(fn (array $book) => Book::factory()->create([
            'title'  => $book[0],
            'author' => $book[1],
            'genre'  => $book[2],
        ]));

        $members = Member::factory()->count(10)->create();

        // Historial: préstamos ya devueltos
        Loan::factory()->returned()->count(30)
            ->sequence(fn () => [
                'book_id'   => $books->random()->id,
                'member_id' => $members->random()->id,
            ])
            ->create();

        // Préstamos en curso (los 2 primeros vencidos). LoanFactory marca el libro como no disponible.
        // Se usan libros y lectores distintos para respetar las reglas de negocio.
        $borrowedBooks = $books->shuffle()->take(7);
        $borrowers = $members->shuffle();

        foreach ($borrowedBooks as $index => $book) {
            $factory = $index < 2 ? Loan::factory()->overdue() : Loan::factory();

            $factory->for($book)->for($borrowers[$index])->create();
        }
    }
}
