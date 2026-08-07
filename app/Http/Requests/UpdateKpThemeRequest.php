<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKpThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('kp_theme') ?? $this->route('id');
        return [
            'title' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:kp_theme,{{\$this->route('kp_theme') ?? \$this->route('id')}},code'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
