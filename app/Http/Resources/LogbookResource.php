<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogbookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'internship_id' => $this->internship_id,
            'date' => $this->date,
            'activity' => $this->activity,
            'evidence_photo' => $this->evidence_photo ? asset('storage/' . $this->evidence_photo) : null,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'internship' => new InternshipResource($this->whenLoaded('internship')),
        ];
    }
}
