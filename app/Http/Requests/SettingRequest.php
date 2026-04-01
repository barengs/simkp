<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'app_name' => 'nullable|string|max:255',
            'app_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'app_favicon' => 'nullable|image|mimes:png,jpg,jpeg,ico|max:1024',
            'app_tagline' => 'nullable|string|max:255',
            'footer_text' => 'nullable|string|max:255',
        ];
    }
}
