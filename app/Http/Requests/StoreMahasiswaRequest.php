<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMahasiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nim' => ['required', 'string', 'unique:mahasiswas,nim'],
            'nama' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:mahasiswas,email'],
            'program_studi_id' => ['required', 'exists:program_studi,id'],
            'no_hp' => ['nullable', 'string'],
        ];
    }
}
