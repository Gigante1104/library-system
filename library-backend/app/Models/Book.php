<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{
    use HasFactory;

    // Catálogo cerrado: evita géneros duplicados ("Novela" / "novela") que distorsionan las estadísticas
    public const GENRES = [
        'Biografía',
        'Ciencia',
        'Ciencia ficción',
        'Cuento',
        'Fantasía',
        'Filosofía',
        'Historia',
        'Infantil',
        'Juvenil',
        'Misterio',
        'Novela',
        'Poesía',
        'Teatro',
        'Terror',
        'Otro',
    ];

    protected $fillable = [
        'title',
        'author',
        'genre',
        'is_available',
    ];

    // Valor por defecto en memoria: sin esto, un libro recién creado se devuelve con is_available = null
    protected $attributes = [
        'is_available' => true,
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
        ];
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}
