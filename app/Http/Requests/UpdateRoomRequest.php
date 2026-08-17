<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('room') ?? $this->route('id');
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:room,{{\$this->route('room') ?? \$this->route('id')}},code'],
            'building' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama ruangan wajib diisi.',
            'name.max' => 'Nama ruangan maksimal 255 karakter.',
            'code.required' => 'Kode ruangan wajib diisi.',
            'code.max' => 'Kode ruangan maksimal 20 karakter.',
            'code.unique' => 'Kode ruangan sudah terdaftar.',
            'building.max' => 'Nama gedung maksimal 255 karakter.',
            'capacity.integer' => 'Kapasitas harus berupa angka.',
            'capacity.min' => 'Kapasitas minimal 0.',
            'description.string' => 'Deskripsi harus berupa teks.',
        ];
    }
}
