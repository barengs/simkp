<?php

namespace App\Services;

use App\Models\PerusahaanKp;
use Illuminate\Support\Facades\DB;

class PerusahaanKpService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return PerusahaanKp::all();
    }

    public function getById(int $id): PerusahaanKp
    {
        return PerusahaanKp::findOrFail($id);
    }

    public function create(array $data): PerusahaanKp
    {
        return DB::transaction(function () use ($data) {
            return PerusahaanKp::create($data);
        });
    }

    public function update(int $id, array $data): PerusahaanKp
    {
        return DB::transaction(function () use ($id, $data) {
            $perusahaan = PerusahaanKp::findOrFail($id);
            $perusahaan->update($data);
            return $perusahaan->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            PerusahaanKp::destroy($id);
            return true;
        });
    }
}
