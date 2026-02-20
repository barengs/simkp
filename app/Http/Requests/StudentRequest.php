<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $student = $this->route('student');
        $userId = is_object($student) ? $student->user_id : null;

        return [
            'nim' => [
                'required',
                'string',
                'max:20',
                \Illuminate\Validation\Rule::unique('students')->where(function ($query) {
                    $activePeriod = \App\Models\Period::where('is_active', true)->first();
                    return $query->where('period_id', $activePeriod?->id);
                })->ignore($this->student?->id),
            ],
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId,
            'major' => 'required|string',
            'batch_year' => 'required|string',
            'phone' => 'nullable|string',
        ];
    }
}
