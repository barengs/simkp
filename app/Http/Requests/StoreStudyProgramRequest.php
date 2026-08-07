<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudyProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:study_program,code'],
            'description' => ['nullable', 'string'],
            'accreditation_level' => ['nullable', 'string', 'max:50'],
            'dean_name' => ['nullable', 'string', 'max:255'],
            'institution_id' => ['nullable', 'exists:institution,id'],
        ];
    }
}
