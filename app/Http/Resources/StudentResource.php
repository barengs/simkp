<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'nim' => $this->nim,
            'name' => $this->user->name ?? null,
            'email' => $this->user->email ?? null,
            'major' => $this->major,
            'batch_year' => $this->batch_year,
            'phone' => $this->phone,
        ];
    }
}
