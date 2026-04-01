<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internship_id' => 'required|exists:internships,id',
            'score_field' => 'required|numeric|min:0|max:100',
            'score_report' => 'required|numeric|min:0|max:100',
            'score_seminar' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
