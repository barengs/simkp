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
}
