<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BimbinganResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bimbingable_id' => $this->bimbingable_id,
            'bimbingable_type' => $this->bimbingable_type,
            'mahasiswa' => new StudentResource($this->whenLoaded('mahasiswa')),
            'dosen' => new LecturerResource($this->whenLoaded('dosen')),
            'tanggal' => $this->tanggal ? $this->tanggal->toIso8601String() : null,
            'aktivitas' => $this->aktivitas,
            'file' => $this->file,
            'catatan_dosen' => $this->catatan_dosen,
            'status' => $this->status,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
