<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterTARequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'judul_diajukan' => 'required|string|max:255|min:10',
            'latar_belakang_singkat' => 'required|string|min:50',
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'judul_diajukan.required' => 'Judul Tugas Akhir wajib diisi.',
            'judul_diajukan.min' => 'Judul Tugas Akhir minimal 10 karakter.',
            'judul_diajukan.max' => 'Judul Tugas Akhir maksimal 255 karakter.',
            'latar_belakang_singkat.required' => 'Latar belakang singkat wajib diisi.',
            'latar_belakang_singkat.min' => 'Latar belakang singkat minimal 50 karakter.',
        ];
    }
}
