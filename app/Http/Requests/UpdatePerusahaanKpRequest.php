<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerusahaanKpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_perusahaan' => ['sometimes', 'string'],
            'alamat' => ['nullable', 'string'],
            'no_telp' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'nama_pic' => ['nullable', 'string'],
        ];
    }
}
