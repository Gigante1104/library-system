<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $secondLastName = $this->faker->lastName();

        return [
            'name'  => "{$firstName} {$lastName} {$secondLastName}",
            'email' => Str::slug("{$firstName} {$lastName}", '.') . $this->faker->unique()->numberBetween(1, 9999) . '@example.com',
            'phone' => $this->faker->optional()->numerify('3#########'),
        ];
    }
}
