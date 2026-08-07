<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MasterDosenResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'nip' => $this->nip,
            'email' => $this->email,
            'no_hp' => $this->no_hp,
            'user' => $this->whenLoaded('user'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
