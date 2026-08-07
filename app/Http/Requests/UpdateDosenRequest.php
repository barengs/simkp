<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nip' => ['sometimes', 'string', 'unique:dosens,nip,' . $this->route('dosen')],
            'nama' => ['sometimes', 'string'],
            'email' => ['sometimes', 'email', 'unique:dosens,email,' . $this->route('dosen')],
            'program_studi_id' => ['sometimes', 'exists:program_studi,id'],
            'no_hp' => ['nullable', 'string'],
        ];
    }
}
