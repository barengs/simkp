<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internship_id' => 'required|exists:internships,id',
            'date' => 'required|date',
            'activity' => 'required|string',
            'evidence_photo' => 'nullable|image|max:2048',
        ];
    }
}
