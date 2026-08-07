<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentId = $this->route('student') ?? $this->route('id');
        return [
            'nim' => ['required', 'string', 'max:20', 'unique:student,nim,' . $studentId],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:student,email,' . $studentId],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'nik' => ['nullable', 'string', 'max:50', 'unique:student,nik,' . $studentId],
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
