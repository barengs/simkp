<?php

namespace App\Services;

use App\Models\PeriodeAkademik;
use Illuminate\Support\Facades\DB;

class PeriodeAkademikService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return PeriodeAkademik::all();
    }

    public function getById(int $id): PeriodeAkademik
    {
        return PeriodeAkademik::findOrFail($id);
    }

    public function create(array $data): PeriodeAkademik
    {
        return DB::transaction(function () use ($data) {
            return PeriodeAkademik::create($data);
        });
    }

    public function update(int $id, array $data): PeriodeAkademik
    {
        return DB::transaction(function () use ($id, $data) {
            $periode = PeriodeAkademik::findOrFail($id);
            $periode->update($data);
            return $periode->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            PeriodeAkademik::destroy($id);
            return true;
        });
    }
}
