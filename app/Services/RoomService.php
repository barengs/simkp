<?php

namespace App\Services;

use App\Models\Room;
use Illuminate\Support\Facades\DB;

class RoomService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Room::all();
    }

    public function getById(int $id): Room
    {
        return Room::findOrFail($id);
    }

    public function create(array $data): Room
    {
        return DB::transaction(function () use ($data) {
            return Room::create($data);
        });
    }

    public function update(int $id, array $data): Room
    {
        return DB::transaction(function () use ($id, $data) {
            $r = Room::findOrFail($id);
            $r->update($data);
            return $r->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            Room::destroy($id);
            return true;
        });
    }
}
