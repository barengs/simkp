<?php

namespace App\Services;

use App\Models\Mahasiswa;
use Illuminate\Support\Facades\DB;

class MahasiswaService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Mahasiswa::all()->loadMissing('programStudi');
    }

    public function getById(int $id): Mahasiswa
    {
        return Mahasiswa::with('programStudi')->findOrFail($id);
    }

    public function create(array $data): Mahasiswa
    {
        return DB::transaction(function () use ($data) {
            return Mahasiswa::create($data);
        });
    }

    public function update(int $id, array $data): Mahasiswa
    {
        return DB::transaction(function () use ($id, $data) {
            $mahasiswa = Mahasiswa::findOrFail($id);
            $mahasiswa->update($data);
            return $mahasiswa->fresh(['programStudi']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            Mahasiswa::destroy($id);
            return true;
        });
    }
}
