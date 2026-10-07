<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\StatisticController;

// Rutas CRUD de libros
Route::apiResource('books', BookController::class);

// Rutas CRUD de lectores
Route::apiResource('members', MemberController::class);

// Rutas de préstamos
Route::get('loans', [LoanController::class, 'index']);
Route::post('loans', [LoanController::class, 'store']);
Route::post('loans/{id}/return', [LoanController::class, 'returnBook']);

// Ruta de estadísticas
Route::get('statistics', [StatisticController::class, 'index']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
