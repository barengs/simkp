<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMahasiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nim' => ['sometimes', 'string', 'unique:mahasiswas,nim,' . $this->route('mahasiswa')],
            'nama' => ['sometimes', 'string'],
            'email' => ['sometimes', 'email', 'unique:mahasiswas,email,' . $this->route('mahasiswa')],
            'program_studi_id' => ['sometimes', 'exists:program_studi,id'],
            'no_hp' => ['nullable', 'string'],
        ];
    }
}
