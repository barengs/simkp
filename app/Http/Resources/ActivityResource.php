<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_name' => $this->user->name,
            'user_role' => $this->user->role,
            'type' => $this->type,
            'description' => $this->description,
            'properties' => $this->properties,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'human_date' => $this->created_at->diffForHumans(),
        ];
    }
}
