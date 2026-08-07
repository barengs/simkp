<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nim' => ['required', 'string', 'max:20', 'unique:student,nim'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:student,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'nik' => ['nullable', 'string', 'max:50', 'unique:student,nik'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'address' => ['nullable', 'string'],
            'parent_phone_number' => ['nullable', 'string', 'max:20'],
            'graduation_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:active,graduated,dropped'],
            'study_program_id' => ['required', 'exists:study_program,id'],
            'lecturer_id' => ['nullable', 'exists:lecturer,id'],
        ];
    }
}
