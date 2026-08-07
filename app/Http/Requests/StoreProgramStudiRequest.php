<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramStudiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'unique:program_studi,kode'],
            'nama' => ['required', 'string'],
        ];
    }
}
