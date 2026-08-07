<?php

namespace App\Services;

use App\Models\Guidance;
use Illuminate\Support\Facades\DB;

class GuidanceService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Guidance::all();
    }

    public function getById(int $id): Guidance
    {
        return Guidance::findOrFail($id);
    }

    public function create(array $data): Guidance
    {
        return DB::transaction(function () use ($data) {
            return Guidance::create($data);
        });
    }

    public function update(int $id, array $data): Guidance
    {
        return DB::transaction(function () use ($id, $data) {
            $g = Guidance::findOrFail($id);
            $g->update($data);
            return $g->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            Guidance::destroy($id);
            return true;
        });
    }
}
