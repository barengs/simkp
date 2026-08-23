<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyFinalProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,rejected'],
            'judul_disetujui' => ['nullable', 'string', 'max:255'],
            'catatan_penolakan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status persetujuan wajib diisi.',
            'status.in'       => 'Status persetujuan tidak valid.',
        ];
    }
}
