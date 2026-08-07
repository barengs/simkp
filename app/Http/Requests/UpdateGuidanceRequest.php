<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGuidanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('guidance') ?? $this->route('id');
        return [
            'student_id' => ['required', 'exists:student,id'],
            'lecturer_id' => ['nullable', 'exists:lecturer,id'],
            'notes' => ['required', 'string'],
            'type' => ['nullable', 'in:regular,initial,final,remedial'],
            'guidance_date' => ['nullable', 'date'],
        ];
    }
}
