<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticController extends Controller
{
    public function index()
    {
        $totalBooks = Book::count();
        $availableBooks = Book::where('is_available', true)->count();
        $borrowedBooks = $totalBooks - $availableBooks;

        $activeLoans = Loan::where('status', 'ACTIVE')->count();
        
        // Préstamos vencidos (fecha límite menor a hoy y sigan activos)
        $overdueLoans = Loan::where('status', 'ACTIVE')
            ->where('due_date', '<', Carbon::now()->toDateString())
            ->count();

        // Top 3 de géneros más prestados
        $topGenres = DB::table('loans')
            ->join('books', 'loans.book_id', '=', 'books.id')
            ->select('books.genre', DB::raw('count(*) as total'))
            ->groupBy('books.genre')
            ->orderByDesc('total')
            ->limit(3)
            ->get();

        return response()->json([
            'overview' => [
                'total_books'     => $totalBooks,
                'available_books' => $availableBooks,
                'borrowed_books'  => $borrowedBooks,
                'active_loans'    => $activeLoans,
                'overdue_loans'   => $overdueLoans,
            ],
            'top_genres' => $topGenres
        ], 200);
    }
}
