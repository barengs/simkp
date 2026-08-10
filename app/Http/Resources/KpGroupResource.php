<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KpGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'code'           => $this->code,
            'status'         => $this->status,
            'rejection_note' => $this->rejection_note,
            'description'    => $this->description,
            'academic_period' => $this->whenLoaded('academicPeriod', fn () => [
                'id'            => $this->academicPeriod->id,
                'name'          => $this->academicPeriod->name,
                'code'          => $this->academicPeriod->code,
                'total_members' => $this->academicPeriod->total_members,
                'is_active'     => $this->academicPeriod->is_active,
            ]),
            'kp_theme' => $this->whenLoaded('kpTheme', fn () => [
                'id'          => $this->kpTheme->id,
                'title'       => $this->kpTheme->title,
                'description' => $this->kpTheme->description,
            ]),
            'kp_company' => $this->whenLoaded('kpCompany', fn () => [
                'id'             => $this->kpCompany->id,
                'name'           => $this->kpCompany->name,
                'address'        => $this->kpCompany->address,
                'contact_person' => $this->kpCompany->contact_person,
                'phone_number'   => $this->kpCompany->phone_number,
            ]),
            // Semua anggota termasuk ketua, dengan role & status yang jelas
            'members' => $this->whenLoaded('members', fn () =>
                $this->members->map(fn ($m) => [
                    'id'         => $m->id,
                    'student_id' => $m->student_id,
                    'role'       => $m->role,    // 'ketua' | 'anggota'
                    'status'     => $m->status,  // 'active' | 'inactive'
                    'join_date'  => $m->join_date,
                    'supervisor_lecturer_id' => $m->supervisor_lecturer_id,
                    'supervisor' => $m->supervisor ? [
                        'id'   => $m->supervisor->id,
                        'name' => $m->supervisor->name,
                        'nidn' => $m->supervisor->nidn,
                    ] : null,
                    'student'    => $m->student ? [
                        'id'   => $m->student->id,
                        'nim'  => $m->student->nim,
                        'name' => $m->student->user?->name,
                    ] : null,
                ])
            ),
            // Dokumen yang diupload untuk kelompok ini
            'kp_documents' => $this->whenLoaded('kpDocuments', fn () =>
                $this->kpDocuments->map(fn ($d) => [
                    'id'              => $d->id,
                    'title'           => $d->title,
                    'file_url'        => $d->file_url,
                    'status'          => $d->status,
                    'submitted_at'    => $d->submitted_at,
                    'remarks'         => $d->remarks,
                    'document_type'   => $d->documentType ? [
                        'id'   => $d->documentType->id,
                        'name' => $d->documentType->name,
                        'code' => $d->documentType->code,
                    ] : null,
                    'created_at'      => $d->created_at,
                ])
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
