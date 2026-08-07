<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKelompokKpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_kelompok' => ['sometimes', 'string', 'unique:kelompok_kp,kode_kelompok,' . $this->route('kelompok_kp')],
            'nama_kelompok' => ['sometimes', 'string'],
            'program_studi_id' => ['sometimes', 'exists:program_studi,id'],
            'periode_akademik_id' => ['sometimes', 'exists:periode_akademik,id'],
            'tema_kp_id' => ['sometimes', 'exists:tema_kp,id'],
            'perusahaan_kp_id' => ['sometimes', 'exists:perusahaan_kp,id'],
            'dosen_pembimbing_id' => ['nullable', 'exists:dosen,id'],
            'dosen_penguji_id' => ['nullable', 'exists:dosen,id'],
            'jumlah_anggota' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'string'],
            'anggota_ids' => ['nullable', 'array'],
            'anggota_ids.*' => ['exists:mahasiswa,id'],
        ];
    }
}
