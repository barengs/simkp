<?php

namespace App\Services;

use App\Models\TemaKp;
use Illuminate\Support\Facades\DB;

class TemaKpService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return TemaKp::all();
    }

    public function getById(int $id): TemaKp
    {
        return TemaKp::findOrFail($id);
    }

    public function create(array $data): TemaKp
    {
        return DB::transaction(function () use ($data) {
            return TemaKp::create($data);
        });
    }

    public function update(int $id, array $data): TemaKp
    {
        return DB::transaction(function () use ($id, $data) {
            $tema = TemaKp::findOrFail($id);
            $tema->update($data);
            return $tema->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            TemaKp::destroy($id);
            return true;
        });
    }
}
