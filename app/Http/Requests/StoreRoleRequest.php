<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama role wajib diisi.',
            'name.max' => 'Nama role maksimal 255 karakter.',
            'name.unique' => 'Nama role sudah terdaftar.',
            'description.max' => 'Deskripsi role maksimal 255 karakter.',
            'permissions.array' => 'Permission harus berupa array.',
            'permissions.*.integer' => 'Permission harus berupa angka.',
            'permissions.*.exists' => 'Salah satu permission tidak ditemukan.',
        ];
    }
}
