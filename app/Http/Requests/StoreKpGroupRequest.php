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
            'start_date'         => ['required', 'date'],
            'end_date'           => ['required', 'date', 'after_or_equal:start_date'],
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
            'kp_theme_id.exists'          => 'Tema tidak ditemukan.',
            'academic_period_id.required' => 'Periode akademik wajib dipilih.',
            'academic_period_id.exists'   => 'Periode tidak ditemukan.',
            'start_date.required'         => 'Tanggal mulai KP wajib diisi.',
            'start_date.date'             => 'Format tanggal mulai tidak valid.',
            'end_date.required'           => 'Tanggal selesai KP wajib diisi.',
            'end_date.date'               => 'Format tanggal selesai tidak valid.',
            'end_date.after_or_equal'     => 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.',
            'anggota_ids.*.exists'        => 'Salah satu mahasiswa yang ditambahkan tidak ditemukan.',
        ];
    }

    protected function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $periodId = $this->input('academic_period_id');
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');

            if (!$periodId || !$startDate || !$endDate) {
                return;
            }

            $period = \App\Models\AcademicPeriod::find($periodId);
            if (!$period) {
                return;
            }

            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);
            $periodStart = \Carbon\Carbon::parse($period->start_date);
            $periodEnd = \Carbon\Carbon::parse($period->end_date);

            if ($start->lt($periodStart) || $end->gt($periodEnd)) {
                $validator->errors()->add(
                    'dates',
                    "Tanggal KP harus berada dalam rentang periode akademik ({$period->start_date} s/d {$period->end_date})."
                );
            }
        });
    }
}
