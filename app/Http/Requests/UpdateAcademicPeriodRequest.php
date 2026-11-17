<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAcademicPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'registration_start_date' => ['nullable', 'date'],
            'registration_end_date' => ['nullable', 'date', 'after_or_equal:registration_start_date'],
            'grading_start_date' => ['nullable', 'date'],
            'grading_end_date' => ['nullable', 'date', 'after_or_equal:grading_start_date'],
            'total_members' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama periode akademik wajib diisi.',
            'name.max' => 'Nama periode akademik maksimal 255 karakter.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.date' => 'Format tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.',
            'registration_start_date.date' => 'Format tanggal mulai pendaftaran tidak valid.',
            'registration_end_date.date' => 'Format tanggal selesai pendaftaran tidak valid.',
            'registration_end_date.after_or_equal' => 'Tanggal selesai pendaftaran harus sama dengan atau setelah tanggal mulai pendaftaran.',
            'grading_start_date.date' => 'Format tanggal mulai penilaian tidak valid.',
            'grading_end_date.date' => 'Format tanggal selesai penilaian tidak valid.',
            'grading_end_date.after_or_equal' => 'Tanggal selesai penilaian harus sama dengan atau setelah tanggal mulai penilaian.',
            'total_members.integer' => 'Total anggota harus berupa angka.',
            'total_members.min' => 'Total anggota minimal 1.',
            'is_active.boolean' => 'Status aktif harus boolean.',
        ];
    }
}
