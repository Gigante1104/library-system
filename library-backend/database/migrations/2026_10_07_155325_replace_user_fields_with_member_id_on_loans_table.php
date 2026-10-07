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
            $table->dropColumn(['user_name', 'user_email']);

            // restrictOnDelete: no se puede borrar un lector que tenga préstamos registrados
            $table->foreignId('member_id')->after('book_id')->constrained()->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('member_id');

            $table->string('user_name')->after('book_id');
            $table->string('user_email')->after('user_name');
        });
    }
};
