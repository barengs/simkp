<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LogbookResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'kelompok_kp' => $this->whenLoaded('kelompokKp'),
            'minggu_ke' => $this->minggu_ke,
            'tanggal' => $this->tanggal,
            'kegiatan' => $this->kegiatan,
            'catatan' => $this->catatan,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
