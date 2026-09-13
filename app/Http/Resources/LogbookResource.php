<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LogbookResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'kp_group_id' => $this->kp_group_id,
            'student_id' => $this->student_id,
            'date' => $this->date,
            'activity' => $this->activity,
            'evidence_photo' => $this->evidence_photo ? '/storage/' . ltrim($this->evidence_photo, '/') : null,
            'status' => $this->status,
            'kp_group' => $this->whenLoaded('kpGroup'),
            'kp_company' => $this->whenLoaded('kpGroup') && $this->kpGroup->relationLoaded('kpCompany')
                ? $this->kpGroup->kpCompany
                : null,
            'student' => $this->whenLoaded('student'),
        ];
    }
}

