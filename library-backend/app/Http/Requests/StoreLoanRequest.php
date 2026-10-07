<?php

namespace App\Http\Requests;

use App\Services\LoanService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $maxDueDate = now()->addDays(LoanService::MAX_LOAN_DAYS)->toDateString();

        return [
            'book_id'   => 'required|integer|exists:books,id',
            'member_id' => 'required|integer|exists:members,id',
            'due_date'  => "required|date|after_or_equal:today|before_or_equal:{$maxDueDate}",
        ];
    }
}
