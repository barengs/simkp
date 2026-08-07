<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LecturerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nip' => $this->nip,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'birth_date' => $this->birth_date,
            'gender' => $this->gender,
            'nidn' => $this->nidn,
            'address' => $this->address,
            'office_address' => $this->office_address,
            'position' => $this->position,
            'expertise' => $this->expertise,
            'profile_picture_url' => $this->profile_picture_url,
            'study_program_id' => $this->study_program_id,
            'study_program' => $this->whenLoaded('studyProgram'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
