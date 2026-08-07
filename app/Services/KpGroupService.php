<?php

namespace App\Services;

use App\Models\KpGroup;
use App\Models\KpGroupMember;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class KpGroupService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return KelompokKp::with([
            'programStudi',
            'periodeAkademik',
            'temaKp',
            'perusahaanKp',
            'dosenPembimbing',
            'dosenPenguji',
            'anggota.mahasiswa.user',
        ])->get();
    }

    public function getById(int $id): KelompokKp
    {
        return KelompokKp::with([
            'programStudi',
            'periodeAkademik',
            'temaKp',
            'perusahaanKp',
            'dosenPembimbing',
            'dosenPenguji',
            'anggota.mahasiswa.user',
        ])->findOrFail($id);
    }

    public function create(array $data): KelompokKp
    {
        return DB::transaction(function () use ($data) {
            $kelompok = KelompokKp::create($data);

            if (isset($data['anggota_ids'])) {
                foreach ($data['anggota_ids'] as $urutan => $studentId) {
                    AnggotaKelompokKp::create([
                        'kelompok_kp_id' => $kelompok->id,
                        'mahasiswa_id' => $studentId,
                        'urutan' => $urutan + 1,
                    ]);
                }
            }

            return $kelompok->load([
                'programStudi', 'periodeAkademik', 'temaKp', 'perusahaanKp',
                'dosenPembimbing', 'dosenPenguji', 'anggota.mahasiswa.user',
            ]);
        });
    }

    public function update(int $id, array $data): KelompokKp
    {
        return DB::transaction(function () use ($id, $data) {
            $kelompok = KelompokKp::findOrFail($id);
            $kelompok->update($data);

            if (isset($data['anggota_ids'])) {
                AnggotaKelompokKp::where('kelompok_kp_id', $id)->delete();
                foreach ($data['anggota_ids'] as $urutan => $studentId) {
                    AnggotaKelompokKp::create([
                        'kelompok_kp_id' => $id,
                        'mahasiswa_id' => $studentId,
                        'urutan' => $urutan + 1,
                    ]);
                }
            }

            return $kelompok->fresh([
                'programStudi', 'periodeAkademik', 'temaKp', 'perusahaanKp',
                'dosenPembimbing', 'dosenPenguji', 'anggota.mahasiswa.user',
            ]);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            AnggotaKelompokKp::where('kelompok_kp_id', $id)->delete();
            KelompokKp::destroy($id);
            return true;
        });
    }

    public function getByMahasiswa(int $studentId): \Illuminate\Database\Eloquent\Collection
    {
        return KelompokKp::with([
            'programStudi', 'periodeAkademik', 'temaKp', 'perusahaanKp',
            'dosenPembimbing', 'dosenPenguji', 'anggota',
        ])
            ->whereHas('anggota', fn($q) => $q->where('mahasiswa_id', $studentId))
            ->get();
    }
}
