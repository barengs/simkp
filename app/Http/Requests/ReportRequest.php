<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
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
        return [
            'internship_id' => ['required', 'exists:internships,id'],
            'file_url' => ['required', 'file', 'mimes:pdf,docx,doc', 'max:5120'], // Max 5MB
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'internship_id.required' => 'ID KP harus diisi.',
            'internship_id.exists' => 'Data KP tidak ditemukan.',
            'file_url.required' => 'File laporan wajib diunggah.',
            'file_url.file' => 'Laporan harus berupa sebuah berkas file.',
            'file_url.mimes' => 'Format file yang diizinkan hanya PDF, DOC, atau DOCX.',
            'file_url.max' => 'Ukuran file maksimal adalah 5MB.',
        ];
    }
}
