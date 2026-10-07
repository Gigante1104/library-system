<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Loan extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_RETURNED = 'RETURNED';

    protected $fillable = [
        'book_id',
        'member_id',
        'loan_date',
        'due_date',
        'return_date',
        'status',
    ];

    // Atributos calculados que se incluyen al convertir el modelo a JSON
    protected $appends = ['is_overdue'];

    protected function casts(): array
    {
        return [
            'loan_date'   => 'date:Y-m-d',
            'due_date'    => 'date:Y-m-d',
            'return_date' => 'date:Y-m-d',
        ];
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Uso: Loan::active()->get()
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Préstamos activos cuya fecha límite ya pasó.
     * Uso: Loan::overdue()->count()
     */
    public function scopeOverdue(Builder $query): void
    {
        $query->active()->whereDate('due_date', '<', today());
    }

    /**
     * El vencimiento se calcula con las fechas en lugar de guardarse,
     * así nunca queda desactualizado y no requiere una tarea programada.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::get(
            fn () => $this->status === self::STATUS_ACTIVE && $this->due_date->lt(today())
        );
    }
}
