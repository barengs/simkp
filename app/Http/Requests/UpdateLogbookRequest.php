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
            'date' => ['sometimes', 'date'],
            'date' => ['sometimes', 'date'],
            'date' => ['sometimes', 'date'],
            'activity' => ['sometimes', 'string'],
            'evidence_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'status' => ['sometimes', 'string', 'in:pending,approved,rejected'],
        ];
    }
}
