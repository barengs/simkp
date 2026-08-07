<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePeriodeAkademikRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_periode' => ['sometimes', 'string'],
            'semester' => ['sometimes', 'string'],
            'tanggal_mulai' => ['sometimes', 'date'],
            'tanggal_selesai' => ['sometimes', 'date', 'after:tanggal_mulai'],
            'jumlah_anggota_kp' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
