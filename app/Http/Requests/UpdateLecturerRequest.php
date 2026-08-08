<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLecturerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $lecturerId = $this->route('lecturer') ?? $this->route('id');
        return [
            'nip' => ['required', 'string', 'max:20', 'unique:lecturer,nip,' . $lecturerId],
            'nidn' => ['nullable', 'string', 'max:20', 'unique:lecturer,nidn,' . $lecturerId],
            // User data (stored in users table)
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ];
    }
}
