<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kp_group_id' => ['required', 'exists:kp_group,id'],
            'date' => ['required', 'date'],
            'attachment' => ['nullable', 'file', 'max:10240'],
            'activity' => ['required', 'string'],
            'evidence_photo' => ['nullable', 'file', 'max:5120'],
            'status' => ['sometimes', 'in:draft,submitted,approved,revision'],
        ];
    }
}
