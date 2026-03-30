<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLogbookStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Use policy or controller logic for supervisor authorization
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:pending,approved',
        ];
    }
}
