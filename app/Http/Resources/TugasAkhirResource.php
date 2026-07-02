<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TugasAkhirResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'internship_id' => $this->internship_id,
            'judul_diajukan' => $this->judul_diajukan,
            'judul_disetujui' => $this->judul_disetujui,
            'latar_belakang_singkat' => $this->latar_belakang_singkat,
            'status' => $this->status,
            'rejection_note' => $this->rejection_note,
            'pembimbing_1' => $this->whenLoaded('pembimbing1', function () {
                return [
                    'id' => $this->pembimbing1->id,
                    'name' => $this->pembimbing1->name,
                ];
            }),
            'pembimbing_2' => $this->whenLoaded('pembimbing2', function () {
                return [
                    'id' => $this->pembimbing2->id,
                    'name' => $this->pembimbing2->name,
                ];
            }),
            'internship' => $this->whenLoaded('internship', function () {
                return [
                    'id' => $this->internship->id,
                    'status' => $this->internship->status,
                    'company' => $this->internship->company ? [
                        'id' => $this->internship->company->id,
                        'name' => $this->internship->company->name,
                    ] : ($this->internship->company_name_manual ? [
                        'name' => $this->internship->company_name_manual,
                    ] : null),
                    'theme' => $this->internship->theme ? [
                        'id' => $this->internship->theme->id,
                        'name' => $this->internship->theme->name,
                    ] : null,
                    'period' => $this->internship->period ? [
                        'id' => $this->internship->period->id,
                        'academic_year' => $this->internship->period->academic_year,
                        'semester' => $this->internship->period->semester,
                    ] : null,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
