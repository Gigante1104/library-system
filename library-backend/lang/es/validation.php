<?php

/*
 * Mensajes de validación en español (solo las reglas que usa la API).
 * Laravel los toma automáticamente cuando APP_LOCALE=es.
 */
return [
    'after_or_equal'  => 'El campo :attribute debe ser una fecha posterior o igual a :date.',
    'before_or_equal' => 'El campo :attribute debe ser una fecha anterior o igual a :date.',
    'boolean'         => 'El campo :attribute debe ser verdadero o falso.',
    'date'            => 'El campo :attribute no es una fecha válida.',
    'email'           => 'El campo :attribute debe ser un correo electrónico válido.',
    'exists'          => 'El :attribute seleccionado no existe.',
    'in'              => 'El :attribute seleccionado no es válido.',
    'integer'         => 'El campo :attribute debe ser un número entero.',
    'max'             => [
        'string' => 'El campo :attribute no puede superar :max caracteres.',
    ],
    'required'        => 'El campo :attribute es obligatorio.',
    'string'          => 'El campo :attribute debe ser texto.',
    'unique'          => 'El :attribute ya está registrado.',

    // Nombres legibles de los campos (reemplazan :attribute)
    'attributes' => [
        'title'     => 'título',
        'author'    => 'autor',
        'genre'     => 'género',
        'name'      => 'nombre',
        'email'     => 'correo',
        'phone'     => 'teléfono',
        'book_id'   => 'libro',
        'member_id' => 'lector',
        'due_date'  => 'fecha de devolución',
    ],
];
