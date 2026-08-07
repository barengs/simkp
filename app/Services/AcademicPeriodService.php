<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\DB;

class AcademicPeriodService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return AcademicPeriod::all();
    }

    public function getById(int $id): AcademicPeriod
    {
        return AcademicPeriod::findOrFail($id);
    }

    public function create(array $data): AcademicPeriod
    {
        return DB::transaction(function () use ($data) {
            return AcademicPeriod::create($data);
        });
    }

    public function update(int $id, array $data): AcademicPeriod
    {
        return DB::transaction(function () use ($id, $data) {
            $a = AcademicPeriod::findOrFail($id);
            $a->update($data);
            return $a->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            AcademicPeriod::destroy($id);
            return true;
        });
    }
}
