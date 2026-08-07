<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KpGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'kode_kelompok' => $this->kode_kelompok,
            'nama_kelompok' => $this->nama_kelompok,
            'program_studi' => $this->whenLoaded('programStudi'),
            'periode_akademik' => $this->whenLoaded('periodeAkademik'),
            'tema_kp' => $this->whenLoaded('temaKp'),
            'perusahaan_kp' => $this->whenLoaded('perusahaanKp'),
            'dosen_pembimbing' => $this->whenLoaded('dosenPembimbing'),
            'dosen_penguji' => $this->whenLoaded('dosenPenguji'),
            'jumlah_anggota' => $this->jumlah_anggota,
            'status' => $this->status,
            'anggota' => $this->whenLoaded('anggota'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
