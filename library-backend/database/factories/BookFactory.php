<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'        => rtrim(fake()->sentence(3), '.'),
            'author'       => fake()->name(),
            'genre'        => fake()->randomElement(Book::GENRES),
            'is_available' => true,
        ];
    }

    /**
     * Uso: Book::factory()->unavailable()->create()
     */
    public function unavailable(): static
    {
        return $this->state(fn () => ['is_available' => false]);
    }
}
