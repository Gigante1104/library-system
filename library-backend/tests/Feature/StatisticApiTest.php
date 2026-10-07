<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatisticApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_works_with_an_empty_database(): void
    {
        // Sin datos no debe fallar por división entre cero
        $response = $this->getJson('/api/statistics');

        $response->assertOk()
            ->assertJsonPath('overview.total_books', 0)
            ->assertJsonPath('overview.availability_rate', 0)
            ->assertJsonCount(6, 'loans_by_month');
    }

    public function test_it_calculates_the_overview_indicators(): void
    {
        Book::factory()->count(2)->create();                 // 2 disponibles
        Loan::factory()->create();                           // 1 activo
        Loan::factory()->overdue()->create();                // 1 vencido
        Loan::factory()->returned()->create([                // devuelto a tiempo
            'due_date'    => today()->subDays(10),
            'return_date' => today()->subDays(12),
        ]);
        Loan::factory()->returned()->create([                // devuelto tarde
            'due_date'    => today()->subDays(10),
            'return_date' => today()->subDays(5),
        ]);

        $response = $this->getJson('/api/statistics');

        // 6 libros: 2 sueltos + 4 de los préstamos; 2 prestados (activo y vencido)
        $response->assertOk()->assertJson([
            'overview' => [
                'total_books'       => 6,
                'borrowed_books'    => 2,
                'availability_rate' => 66.7,
                'active_loans'      => 2,
                'overdue_loans'     => 1,
                'on_time_rate'      => 50,
            ],
        ]);
    }

    public function test_it_ranks_genres_by_number_of_loans(): void
    {
        $novel = Book::factory()->create(['genre' => 'Novela']);
        $poetry = Book::factory()->create(['genre' => 'Poesía']);
        Loan::factory()->returned()->count(3)->for($novel)->create();
        Loan::factory()->returned()->count(1)->for($poetry)->create();

        $response = $this->getJson('/api/statistics');

        $response->assertJsonPath('top_genres.0.genre', 'Novela')
            ->assertJsonPath('top_genres.0.total', 3);
    }
}
