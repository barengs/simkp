<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TemaKpResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nama_tema' => $this->nama_tema,
            'deskripsi' => $this->deskripsi,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
