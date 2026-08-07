<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMasterDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string'],
            'nip' => ['required', 'string', 'unique:master_dosens,nip'],
            'email' => ['required', 'email', 'unique:master_dosens,email'],
            'no_hp' => ['nullable', 'string'],
        ];
    }
}
