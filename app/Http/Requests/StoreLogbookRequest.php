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
            'date' => ['nullable', 'date'],
            'activity' => ['required', 'string'],
            'evidence_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'status' => ['required', 'string', 'in:pending,approved,rejected'],
        ];
    }
}
