<?php

namespace App\Services;

use App\Models\Dosen;
use Illuminate\Support\Facades\DB;

class DosenService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Dosen::all()->loadMissing('programStudi');
    }

    public function getById(int $id): Dosen
    {
        return Dosen::with('programStudi')->findOrFail($id);
    }

    public function create(array $data): Dosen
    {
        return DB::transaction(function () use ($data) {
            return Dosen::create($data);
        });
    }

    public function update(int $id, array $data): Dosen
    {
        return DB::transaction(function () use ($id, $data) {
            $dosen = Dosen::findOrFail($id);
            $dosen->update($data);
            return $dosen->fresh(['programStudi']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            Dosen::destroy($id);
            return true;
        });
    }
}
