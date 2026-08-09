<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Otorisasi ditangani di controller
    }

    public function rules(): array
    {
        $documentTypeId = $this->route('document_type')?->id;

        return [
            'name'        => ['required', 'string', 'max:255', Rule::unique('document_type')->ignore($documentTypeId)],
            'code'        => ['required', 'string', 'max:50', Rule::unique('document_type')->ignore($documentTypeId)],
            'description' => ['nullable', 'string', 'max:500'],
            'is_required' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Nama tipe dokumen wajib diisi.',
            'name.unique'          => 'Nama tipe dokumen sudah terdaftar.',
            'code.required'        => 'Kode tipe dokumen wajib diisi.',
            'code.unique'          => 'Kode tipe dokumen sudah terdaftar.',
            'description.max'      => 'Deskripsi maksimal 500 karakter.',
            'is_required.boolean'  => 'Bidang wajib harus boolean.',
        ];
    }
}
