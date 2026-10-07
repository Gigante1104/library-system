<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            // Antes: cascade borraba el historial de préstamos al eliminar un libro
            $table->dropForeign(['book_id']);
            $table->foreign('book_id')->references('id')->on('books')->restrictOnDelete();

            // OVERDUE se calcula a partir de due_date (ver Loan::isOverdue), no se almacena
            $table->enum('status', ['ACTIVE', 'RETURNED'])->default('ACTIVE')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropForeign(['book_id']);
            $table->foreign('book_id')->references('id')->on('books')->cascadeOnDelete();

            $table->enum('status', ['ACTIVE', 'RETURNED', 'OVERDUE'])->default('ACTIVE')->change();
        });
    }
};
