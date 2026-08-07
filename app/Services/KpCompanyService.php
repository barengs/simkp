<?php

namespace App\Services;

use App\Models\KpCompany;
use Illuminate\Support\Facades\DB;

class KpCompanyService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return KpCompany::all();
    }

    public function getById(int $id): KpCompany
    {
        return KpCompany::findOrFail($id);
    }

    public function create(array $data): KpCompany
    {
        return DB::transaction(function () use ($data) {
            return KpCompany::create($data);
        });
    }

    public function update(int $id, array $data): KpCompany
    {
        return DB::transaction(function () use ($id, $data) {
            $k = KpCompany::findOrFail($id);
            $k->update($data);
            return $k->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            KpCompany::destroy($id);
            return true;
        });
    }
}
