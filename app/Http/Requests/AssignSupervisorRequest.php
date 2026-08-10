<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignSupervisorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // otorisasi ditangani di controller
    }

    public function rules(): array
    {
        return [
            'kp_group_id' => ['required', 'exists:kp_group,id'],
            'lecturer_id' => ['required', 'exists:lecturer,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'kp_group_id.required' => 'Kelompok KP wajib dipilih.',
            'kp_group_id.exists' => 'Kelompok KP tidak ditemukan.',
            'lecturer_id.required' => 'Dosen pembimbing wajib dipilih.',
            'lecturer_id.exists' => 'Dosen tidak ditemukan.',
        ];
    }
}