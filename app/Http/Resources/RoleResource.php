<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'permissions' => $this->relationLoaded('permissions')
                ? $this->permissions->map(fn($p) => ['id' => $p->id, 'name' => $p->name])
                : [],
        ];
    }
}
