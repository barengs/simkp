<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMasterDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['sometimes', 'string'],
            'nip' => ['sometimes', 'string', 'unique:master_dosens,nip,' . $this->route('master_dosen')],
            'email' => ['sometimes', 'email', 'unique:master_dosens,email,' . $this->route('master_dosen')],
            'no_hp' => ['nullable', 'string'],
        ];
    }
}
