<?php

namespace App\Services;

use App\Models\ProgramStudi;
use Illuminate\Support\Facades\DB;

class ProgramStudiService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return ProgramStudi::all();
    }

    public function getById(int $id): ProgramStudi
    {
        return ProgramStudi::findOrFail($id);
    }

    public function create(array $data): ProgramStudi
    {
        return DB::transaction(function () use ($data) {
            return ProgramStudi::create($data);
        });
    }

    public function update(int $id, array $data): ProgramStudi
    {
        return DB::transaction(function () use ($id, $data) {
            $programStudi = ProgramStudi::findOrFail($id);
            $programStudi->update($data);
            return $programStudi->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            ProgramStudi::destroy($id);
            return true;
        });
    }
}
