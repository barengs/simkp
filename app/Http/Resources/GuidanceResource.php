<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GuidanceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'lecturer_id' => $this->lecturer_id,
            'notes' => $this->notes,
            'type' => $this->type,
            'guidance_date' => $this->guidance_date,
            'student' => $this->whenLoaded('student'),
            'lecturer' => $this->whenLoaded('lecturer'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
