<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kp_group_id' => ['sometimes', 'exists:kp_group,id'],
            'date' => ['sometimes', 'date'],
            'attachment' => ['nullable', 'file', 'max:10240'],
            'activity' => ['sometimes', 'string'],
            'evidence_photo' => ['nullable', 'file', 'max:5120'],
            'status' => ['sometimes', 'in:pending,approved'],
        ];
    }
}
