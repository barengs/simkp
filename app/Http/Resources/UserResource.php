<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_picture_url' => $this->profile_picture_url,
            'phone_number' => $this->phone_number,
            'lecturer_id' => $this->lecturer?->id,
            'lecturer' => $this->whenLoaded('lecturer'),
            'student_id' => $this->student?->id,
            'student' => $this->whenLoaded('student'),
            'roles' => $this->whenLoaded('roles'),
            'permissions' => $this->whenLoaded('permissions'),
        ];
    }
}
