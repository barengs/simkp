<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePeriodeAkademikRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_periode' => ['required', 'string'],
            'semester' => ['required', 'string'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after:tanggal_mulai'],
            'jumlah_anggota_kp' => ['integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }
}
