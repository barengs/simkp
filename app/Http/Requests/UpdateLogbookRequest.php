<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kelompok_kp_id' => ['sometimes', 'exists:kelompok_kp,id'],
            'minggu_ke' => ['sometimes', 'integer', 'min:1'],
            'tanggal' => ['sometimes', 'date'],
            'kegiatan' => ['sometimes', 'string'],
            'catatan' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:draft,submitted,approved,revision'],
        ];
    }
}
