<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * Se lanza cuando una operación viola una regla de negocio
 * (ej. prestar un libro que no está disponible).
 */
class BusinessRuleException extends Exception
{
    /**
     * Laravel llama a este método automáticamente para convertir
     * la excepción en una respuesta HTTP 409 Conflict.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
        ], 409);
    }
}
