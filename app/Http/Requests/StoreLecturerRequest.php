<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLecturerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nip' => ['required', 'string', 'max:20', 'unique:lecturer,nip'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:lecturer,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'nidn' => ['nullable', 'string', 'max:20', 'unique:lecturer,nidn'],
            'address' => ['nullable', 'string'],
            'office_address' => ['nullable', 'string'],
            'position' => ['nullable', 'string', 'max:100'],
            'expertise' => ['nullable', 'string', 'max:255'],
            'profile_picture_url' => ['nullable', 'url', 'max:255'],
            'study_program_id' => ['required', 'exists:study_program,id'],
        ];
    }
}
