<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVerifikasiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|required|string|in:diajukan,ditolak,disetujui',
            'rejection_note' => 'nullable|required_if:status,ditolak|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Status tidak valid.',
            'rejection_note.required_if' => 'Catatan penolakan wajib diisi.',
        ];
    }
}