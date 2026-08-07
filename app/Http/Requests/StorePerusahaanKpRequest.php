<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePerusahaanKpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_perusahaan' => ['required', 'string'],
            'alamat' => ['nullable', 'string'],
            'no_telp' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'nama_pic' => ['nullable', 'string'],
        ];
    }
}
