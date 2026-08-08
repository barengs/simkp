<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nim' => $this->nim,
            'is_active' => (bool) $this->is_active,
            'study_program_id' => $this->study_program_id,
            // camelCase for frontend consistency
            'studyProgram' => $this->whenLoaded('studyProgram'),
            'study_program' => $this->whenLoaded('studyProgram'),
            'name' => $this->user->name ?? null,
            'email' => $this->user->email ?? null,
            'phone_number' => $this->user->phone_number ?? null,
            'user' => $this->whenLoaded('user'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
