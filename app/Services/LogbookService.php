<?php

namespace App\Services;

use App\Models\Logbook;
use App\Models\KpGroup;
use Illuminate\Support\Facades\DB;

class LogbookService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::with([
            'kelompokKp.programStudi',
            'kelompokKp.periodeAkademik',
            'kelompokKp.dosenPembimbing',
        ])->get();
    }

    public function getByKelompok(int $kpGroupId): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::with(['kelompokKp.programStudi', 'kelompokKp.periodeAkademik'])
            ->where('kelompok_kp_id', $kpGroupId)
            ->orderBy('minggu_ke')
            ->orderBy('tanggal')
            ->get();
    }

    public function getById(int $id): Logbook
    {
        return Logbook::with(['kelompokKp.programStudi', 'kelompokKp.periodeAkademik', 'kelompokKp.dosenPembimbing'])
            ->findOrFail($id);
    }

    public function create(array $data): Logbook
    {
        return Logbook::create($data);
    }

    public function update(int $id, array $data): Logbook
    {
        $logbook = Logbook::findOrFail($id);
        $logbook->update($data);
        return $logbook->fresh(['kelompokKp']);
    }

    public function delete(int $id): bool
    {
        Logbook::destroy($id);
        return true;
    }
}
