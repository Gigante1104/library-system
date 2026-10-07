<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'member_id',
        'loan_date',
        'due_date',
        'return_date',
        'status',
    ];

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
}
