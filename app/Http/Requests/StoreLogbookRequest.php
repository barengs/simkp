<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kelompok_kp_id' => ['required', 'exists:kelompok_kp,id'],
            'minggu_ke' => ['required', 'integer', 'min:1'],
            'tanggal' => ['required', 'date'],
            'kegiatan' => ['required', 'string'],
            'catatan' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:draft,submitted,approved,revision'],
        ];
    }
}
