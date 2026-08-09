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
                    'student'    => $m->student ? [
                        'id'   => $m->student->id,
                        'nim'  => $m->student->nim,
                        'name' => $m->student->user?->name,
                    ] : null,
                ])
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
