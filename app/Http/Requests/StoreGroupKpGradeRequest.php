<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGroupKpGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kp_group_id' => ['required', 'exists:kp_group,id'],
            'score_field' => ['nullable', 'numeric', 'between:0,100'],
            'score_report' => ['nullable', 'numeric', 'between:0,100'],
            'score_seminar' => ['nullable', 'numeric', 'between:0,100'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
