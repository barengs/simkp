<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InternshipRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Usually student role is allowed
    }

    public function rules(): array
    {
        return [
            'period_id' => 'required|exists:periods,id',
            'company_id' => 'nullable|exists:companies,id',
            'company_name_manual' => 'required_without:company_id|string|max:255',
            'company_address_manual' => 'required_without:company_id|string|max:500',
            'company_contact_manual' => 'required_without:company_id|string|max:255',
            'company_phone_manual' => 'required_without:company_id|string|max:50',
            'theme_id' => 'required|exists:themes,id',
            'members' => 'nullable|array|max:3',
            'members.*' => [
                'exists:students,id',
                'distinct',
                function ($attribute, $value, $fail) {
                    $isRegistered = \App\Models\InternshipMember::where('student_id', $value)->exists() ||
                        \App\Models\Internship::where('leader_id', $value)->exists();
                    if ($isRegistered) {
                        $fail('Mahasiswa dengan ID ' . $value . ' sudah terdaftar di kelompok lain.');
                    }
                }
            ],
            'proposal' => [
                'required',
                'file',
                'mimes:pdf',
                'max:5120',
                function ($attribute, $value, $fail) {
                    if (preg_match('/\.(php|js|sh|exe|bat)$/i', $value->getClientOriginalName())) {
                        $fail('File ' . $attribute . ' mengandung ekstensi yang dilarang.');
                    }
                }
            ],
            'krs' => [
                'required',
                'file',
                'mimes:pdf',
                'max:5120',
                function ($attribute, $value, $fail) {
                    if (preg_match('/\.(php|js|sh|exe|bat)$/i', $value->getClientOriginalName())) {
                        $fail('File ' . $attribute . ' mengandung ekstensi yang dilarang.');
                    }
                }
            ],
            'ktp' => [
                'required',
                'file',
                'mimes:pdf,jpg,png,jpeg',
                'max:5120',
                function ($attribute, $value, $fail) {
                    if (preg_match('/\.(php|js|sh|exe|bat)$/i', $value->getClientOriginalName())) {
                        $fail('File ' . $attribute . ' mengandung ekstensi yang dilarang.');
                    }
                }
            ],
            'surat_rekomendasi' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:5120',
                function ($attribute, $value, $fail) {
                    if ($value && preg_match('/\.(php|js|sh|exe|bat)$/i', $value->getClientOriginalName())) {
                        $fail('File ' . $attribute . ' mengandung ekstensi yang dilarang.');
                    }
                }
            ],
        ];
    }
}
