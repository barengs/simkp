<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVerifikasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:draft,submitted,approved,rejected,ongoing,grading,finished'],
            'dosen_pembimbing_id' => ['nullable', 'exists:dosen,id'],
            'dosen_penguji_id' => ['nullable', 'exists:dosen,id'],
        ];
    }
}
