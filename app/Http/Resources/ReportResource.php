<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'kp_group_id' => $this->kp_group_id,
            'student_id' => $this->student_id,
            'status' => $this->status,
            'rejection_note' => $this->rejection_note,
            'title' => $this->title,
            'description' => $this->description,
            'file_url' => $this->file_url ? '/storage/' . ltrim($this->file_url, '/') : null,
            'kp_group' => $this->whenLoaded('kpGroup'),
            'student' => $this->whenLoaded('student'),
        ];
    }
}
