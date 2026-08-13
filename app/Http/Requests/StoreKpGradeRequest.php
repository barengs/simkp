<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKpGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kp_group_member_id' => ['required', 'exists:kp_group_member,id'],
            'evaluation_criteria_id' => ['nullable', 'exists:evaluation_criteria,id'],
            'score_field' => ['nullable', 'numeric', 'between:0,100'],
            'score_report' => ['nullable', 'numeric', 'between:0,100'],
            'score_seminar' => ['nullable', 'numeric', 'between:0,100'],
            'final_grade' => ['nullable', 'string', 'max:2', 'in:A,B,C,D,E'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
