<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKelompokKpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_kelompok' => ['required', 'string', 'unique:kelompok_kp,kode_kelompok'],
            'nama_kelompok' => ['required', 'string'],
            'program_studi_id' => ['required', 'exists:program_studi,id'],
            'periode_akademik_id' => ['required', 'exists:periode_akademik,id'],
            'tema_kp_id' => ['required', 'exists:tema_kp,id'],
            'perusahaan_kp_id' => ['required', 'exists:perusahaan_kp,id'],
            'dosen_pembimbing_id' => ['nullable', 'exists:dosen,id'],
            'dosen_penguji_id' => ['nullable', 'exists:dosen,id'],
            'jumlah_anggota' => ['required', 'integer', 'min:1'],
            'anggota_ids' => ['nullable', 'array'],
            'anggota_ids.*' => ['exists:mahasiswa,id'],
        ];
    }
}
