<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LecturerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $lecturer = $this->route('lecturer');
        $userId = is_object($lecturer) ? $lecturer->user_id : null;

        return [
            'nip' => 'required|string|unique:lecturers,nip,' . ($lecturer->id ?? ''),
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . ($userId ?? ''),
            'phone' => 'required|string',
        ];
    }
}
