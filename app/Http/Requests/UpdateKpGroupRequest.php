<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKpGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // otorisasi ditangani di controller
    }

    public function rules(): array
    {
        return [
            'kp_company_id'      => ['sometimes', 'exists:kp_company,id'],
            'kp_theme_id'        => ['sometimes', 'exists:kp_theme,id'],
            'academic_period_id' => ['sometimes', 'exists:academic_period,id'],
            'start_date'         => ['nullable', 'date'],
            'end_date'           => ['nullable', 'date', 'after_or_equal:start_date'],
            'description'        => ['nullable', 'string', 'max:1000'],
            'anggota_ids'        => ['nullable', 'array'],
            'anggota_ids.*'      => ['integer', 'exists:student,id'],
            'status'             => ['sometimes', 'in:draft,submitted,approved,rejected,ongoing,grading,finished'],
        ];
    }

    protected function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $anggotaIds = $this->input('anggota_ids', []);

            // Check existing group membership for added members (only for new additions)
            if (!empty($anggotaIds)) {
                $existingMemberships = \App\Models\KpGroupMember::whereIn('student_id', $anggotaIds)
                    ->whereHas('kpGroup', function($q) {
                        $q->whereIn('status', ['submitted', 'approved', 'ongoing', 'grading']);
                    })
                    ->pluck('student_id')
                    ->toArray();

                if (!empty($existingMemberships)) {
                    $students = \App\Models\Student::whereIn('id', $existingMemberships)->with('user')->get();
                    $names = $students->pluck('user.name')->implode(', ');
                    $validator->errors()->add(
                        'anggota_ids',
                        "Mahasiswa {$names} sudah tergabung dalam kelompok KP lain."
                    );
                }
            }
        });
    }
}
