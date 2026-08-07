<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PerusahaanKpResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nama_perusahaan' => $this->nama_perusahaan,
            'alamat' => $this->alamat,
            'no_telp' => $this->no_telp,
            'email' => $this->email,
            'nama_pic' => $this->nama_pic,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
