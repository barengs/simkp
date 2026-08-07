<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTemaKpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_tema' => ['sometimes', 'string'],
            'deskripsi' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
