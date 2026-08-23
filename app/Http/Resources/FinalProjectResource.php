<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BimbinganResource;

class FinalProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'mahasiswa' => new StudentResource($this->whenLoaded('mahasiswa')),
            'periode' => new AcademicPeriodResource($this->whenLoaded('periode')),
            'judul_disetujui' => $this->judul_disetujui,
            'tanggal_pengajuan' => $this->tanggal_pengajuan ? $this->tanggal_pengajuan->toIso8601String() : null,
            'catatan_penolakan' => $this->catatan_penolakan,
            'status' => $this->status,
            'dosen_pembimbing' => $this->whenLoaded('dosenPembimbing', function () {
                return $this->dosenPembimbing->map(function ($pembimbing) {
                    return [
                        'id' => $pembimbing->id,
                        'dosen_id' => $pembimbing->dosen_id,
                        'peran' => $pembimbing->peran,
                        'status_acc_ujian' => $pembimbing->status_acc_ujian,
                        'status_acc_revisi' => $pembimbing->status_acc_revisi,
                        'dosen' => new LecturerResource($pembimbing->dosen),
                    ];
                });
            }, []),
            'bimbingan' => BimbinganResource::collection($this->whenLoaded('bimbingan')),
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
