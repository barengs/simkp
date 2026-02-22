<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternshipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'leader' => new StudentResource($this->leader),
            'period' => $this->period,
            'company' => $this->company ? $this->company : [
                'name' => $this->company_name_manual,
                'address' => $this->company_address_manual,
                'contact_person' => $this->company_contact_manual, // Fix potential collision or naming
                'phone' => $this->company_phone_manual,
            ],
            'theme' => $this->theme,
            'supervisor' => $this->supervisor,
            'status' => $this->status,
            'rejection_note' => $this->rejection_note,
            'proposal_url' => $this->proposal_url,
            'krs_url' => $this->krs_url,
            'ktp_url' => $this->ktp_url,
            'surat_rekomendasi_url' => $this->surat_rekomendasi_url,
            'students' => StudentResource::collection($this->students),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
