<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProgramStudiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['sometimes', 'string', 'unique:program_studi,kode,' . $this->route('program_studi')],
            'nama' => ['sometimes', 'string'],
        ];
    }
}
