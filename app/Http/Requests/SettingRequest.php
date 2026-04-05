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
            'app_logo' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        $rules = ['image', 'mimes:png,jpg,jpeg,svg', 'max:2048'];
                        $validator = \Illuminate\Support\Facades\Validator::make([$attribute => $value], [$attribute => $rules]);
                        if ($validator->fails()) {
                            $fail($validator->errors()->first($attribute));
                        }
                    } elseif (!is_string($value)) {
                        $fail("The {$attribute} must be an image or a valid URL.");
                    }
                },
            ],
            'app_favicon' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        $rules = ['image', 'mimes:png,jpg,jpeg,ico', 'max:1024'];
                        $validator = \Illuminate\Support\Facades\Validator::make([$attribute => $value], [$attribute => $rules]);
                        if ($validator->fails()) {
                            $fail($validator->errors()->first($attribute));
                        }
                    } elseif (!is_string($value)) {
                        $fail("The {$attribute} must be an image or a valid URL.");
                    }
                },
            ],
            'app_tagline' => 'nullable|string|max:255',
            'footer_text' => 'nullable|string|max:255',
            'max_group_members' => 'nullable|integer|min:1|max:10',
        ];
    }
}
