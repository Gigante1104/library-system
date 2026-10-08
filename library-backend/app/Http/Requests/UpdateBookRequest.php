<?php

namespace App\Http\Requests;

use App\Models\Book;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * is_available no se acepta: solo lo modifica el flujo de préstamos.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'  => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'genre'  => ['sometimes', 'required', Rule::in(Book::GENRES)],
        ];
    }
}
