<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudyProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:study_program,code'],
            'description' => ['nullable', 'string'],
            'accreditation_level' => ['nullable', 'string', 'max:50'],
            'dean_name' => ['nullable', 'string', 'max:255'],
            'institution_id' => ['nullable', 'exists:institution,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama program studi wajib diisi.',
            'name.max' => 'Nama program studi maksimal 255 karakter.',
            'code.required' => 'Kode program studi wajib diisi.',
            'code.max' => 'Kode program studi maksimal 20 karakter.',
            'code.unique' => 'Kode program studi sudah terdaftar.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'accreditation_level.max' => 'Level akreditasi maksimal 50 karakter.',
            'dean_name.max' => 'Nama dekan maksimal 255 karakter.',
            'institution_id.exists' => 'Institusi tidak ditemukan.',
        ];
    }
}
