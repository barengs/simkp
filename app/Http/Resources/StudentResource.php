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
            'nik' => $this->nik,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'birth_date' => $this->birth_date,
            'gender' => $this->gender,
            'address' => $this->address,
            'parent_phone_number' => $this->parent_phone_number,
            'graduation_date' => $this->graduation_date,
            'status' => $this->status,
            'study_program_id' => $this->study_program_id,
            'lecturer_id' => $this->lecturer_id,
            'profile_picture_url' => $this->profile_picture_url,
            'study_program' => $this->whenLoaded('studyProgram'),
            'lecturer' => $this->whenLoaded('lecturer'),
            'user' => $this->whenLoaded('user'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
