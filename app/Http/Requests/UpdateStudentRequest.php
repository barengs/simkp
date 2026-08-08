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
            'is_active' => ['nullable', 'boolean'],
            'study_program_id' => ['required', 'exists:study_program,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            ]);
        }
    }
}
