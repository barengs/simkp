<?php

namespace App\Services;

use App\Models\KpTheme;
use Illuminate\Support\Facades\DB;

class KpThemeService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return KpTheme::all();
    }

    public function getById(int $id): KpTheme
    {
        return KpTheme::findOrFail($id);
    }

    public function create(array $data): KpTheme
    {
        return DB::transaction(function () use ($data) {
            return KpTheme::create($data);
        });
    }

    public function update(int $id, array $data): KpTheme
    {
        return DB::transaction(function () use ($id, $data) {
            $k = KpTheme::findOrFail($id);
            $k->update($data);
            return $k->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            KpTheme::destroy($id);
            return true;
        });
    }
}
