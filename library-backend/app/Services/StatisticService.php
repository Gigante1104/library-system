<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Cálculo de las métricas del dashboard de estadísticas.
 */
class StatisticService
{
    public const TOP_LIMIT = 3;
    public const MONTHS_HISTORY = 6;

    public function getDashboard(): array
    {
        return [
            'overview'       => $this->overview(),
            'top_genres'     => $this->topGenres(),
            'top_books'      => $this->topBooks(),
            'top_members'    => $this->topMembers(),
            'loans_by_month' => $this->loansByMonth(),
        ];
    }

    /**
     * Indicadores generales (KPIs) del estado actual de la biblioteca.
     */
    private function overview(): array
    {
        $totalBooks = Book::count();
        $availableBooks = Book::where('is_available', true)->count();

        $returnedLoans = Loan::where('status', Loan::STATUS_RETURNED)->count();
        $returnedOnTime = Loan::where('status', Loan::STATUS_RETURNED)
            ->whereColumn('return_date', '<=', 'due_date')
            ->count();

        return [
            'total_books'       => $totalBooks,
            'available_books'   => $availableBooks,
            'borrowed_books'    => $totalBooks - $availableBooks,
            'availability_rate' => $this->percentage($availableBooks, $totalBooks),
            'total_members'     => Member::count(),
            'total_loans'       => Loan::count(),
            'active_loans'      => Loan::active()->count(),
            'overdue_loans'     => Loan::overdue()->count(),
            'on_time_rate'      => $this->percentage($returnedOnTime, $returnedLoans),
        ];
    }

    /**
     * Géneros con más préstamos (histórico).
     */
    private function topGenres(): Collection
    {
        return DB::table('loans')
            ->join('books', 'loans.book_id', '=', 'books.id')
            ->select('books.genre', DB::raw('COUNT(*) as total'))
            ->groupBy('books.genre')
            ->orderByDesc('total')
            ->limit(self::TOP_LIMIT)
            ->get();
    }

    /**
     * Libros más prestados (histórico).
     */
    private function topBooks(): Collection
    {
        // select() va antes de withCount(); si no, withCount agrega todas las columnas (SELECT *)
        return Book::select(['id', 'title', 'author', 'genre'])
            ->whereHas('loans')
            ->withCount('loans')
            ->orderByDesc('loans_count')
            ->limit(self::TOP_LIMIT)
            ->get();
    }

    /**
     * Lectores con más préstamos (histórico).
     */
    private function topMembers(): Collection
    {
        return Member::select(['id', 'name', 'email'])
            ->whereHas('loans')
            ->withCount('loans')
            ->orderByDesc('loans_count')
            ->limit(self::TOP_LIMIT)
            ->get();
    }

    /**
     * Cantidad de préstamos por mes en los últimos meses, incluyendo meses sin préstamos.
     * Se agrupa en PHP para no depender de funciones de fecha propias de cada motor SQL.
     */
    private function loansByMonth(): Collection
    {
        $start = today()->startOfMonth()->subMonths(self::MONTHS_HISTORY - 1);

        $counts = Loan::whereDate('loan_date', '>=', $start)
            ->pluck('loan_date')
            ->countBy(fn ($date) => $date->format('Y-m'));

        // Se generan todos los meses del rango para que los meses en 0 también aparezcan
        return collect(range(0, self::MONTHS_HISTORY - 1))->map(function (int $offset) use ($start, $counts) {
            $month = $start->copy()->addMonths($offset)->format('Y-m');

            return ['month' => $month, 'total' => $counts->get($month, 0)];
        });
    }

    /**
     * Porcentaje redondeado a 1 decimal; evita la división por cero.
     */
    private function percentage(int $part, int $total): float
    {
        return $total > 0 ? round($part / $total * 100, 1) : 0.0;
    }
}
