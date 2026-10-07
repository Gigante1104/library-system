<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{
    use HasFactory;

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
