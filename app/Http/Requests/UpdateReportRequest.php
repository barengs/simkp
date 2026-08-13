<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kp_group_id' => ['sometimes', 'exists:kp_group,id'],
            'status' => ['sometimes', 'in:pending,approved,rejected'],
            'rejection_note' => ['nullable', 'string', 'max:2000'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'file' => ['nullable', 'file', 'max:10240'],
        ];
    }
}
