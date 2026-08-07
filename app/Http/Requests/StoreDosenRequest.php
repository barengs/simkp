<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDosenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nip' => ['required', 'string', 'unique:dosens,nip'],
            'nama' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:dosens,email'],
            'program_studi_id' => ['required', 'exists:program_studi,id'],
            'no_hp' => ['nullable', 'string'],
        ];
    }
}
