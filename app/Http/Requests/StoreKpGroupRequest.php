<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKpGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // otorisasi ditangani di controller
    }

    public function rules(): array
    {
        return [
            'kp_company_id'      => ['required', 'exists:kp_company,id'],
            'kp_theme_id'        => ['required', 'exists:kp_theme,id'],
            'academic_period_id' => ['required', 'exists:academic_period,id'],
            'description'        => ['nullable', 'string', 'max:1000'],
            // anggota_ids: daftar student.id anggota (di luar ketua, ketua di-inject controller)
            'anggota_ids'        => ['nullable', 'array'],
            'anggota_ids.*'      => ['integer', 'exists:student,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'kp_company_id.required'      => 'Perusahaan tujuan KP wajib dipilih.',
            'kp_company_id.exists'        => 'Perusahaan tidak ditemukan.',
            'kp_theme_id.required'        => 'Tema KP wajib dipilih.',
            'kp_theme_id.exists'          => 'Tema KP tidak ditemukan.',
            'academic_period_id.required' => 'Periode akademik wajib dipilih.',
            'academic_period_id.exists'   => 'Periode akademik tidak ditemukan.',
            'anggota_ids.*.exists'        => 'Salah satu mahasiswa yang ditambahkan tidak ditemukan.',
        ];
    }
}
