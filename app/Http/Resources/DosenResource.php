<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DosenResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nip' => $this->nip,
            'nama' => $this->nama,
            'email' => $this->email,
            'no_hp' => $this->no_hp,
            'program_studi' => $this->whenLoaded('programStudi'),
            'user' => $this->whenLoaded('user'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
