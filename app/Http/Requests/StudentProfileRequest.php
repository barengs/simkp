<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'nim' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'nim')->where(function ($query) use ($userId) {
                    // Allow the same NIM if it belongs to the current user
                    return $query->where('user_id', '!=', $userId);
                }),
            ],
            'major' => ['required', 'string', 'max:100'],
            'batch_year' => ['required', 'string', 'max:4'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'nim.required' => 'NIM wajib diisi.',
            'nim.unique' => 'NIM sudah terdaftar.',
            'major.required' => 'Jurusan wajib diisi.',
            'batch_year.required' => 'Tahun angkatan wajib diisi.',
        ];
    }
}
