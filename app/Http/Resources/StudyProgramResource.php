<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudyProgramResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'accreditation_level' => $this->accreditation_level,
            'dean_name' => $this->dean_name,
            'institution_id' => $this->institution_id,
            'institution' => $this->whenLoaded('institution'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
