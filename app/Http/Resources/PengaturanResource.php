<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PengaturanResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'key' => $this->key,
            'value' => $this->value,
            'tipe' => $this->tipe,
        ];
    }
}
