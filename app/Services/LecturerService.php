<?php

namespace App\Services;

use App\Models\Lecturer;
use Illuminate\Support\Facades\DB;

class LecturerService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Lecturer::all()->loadMissing('studyProgram');
    }

    public function getById(int $id): Lecturer
    {
        return Lecturer::with('studyProgram')->findOrFail($id);
    }

    public function create(array $data): Lecturer
    {
        return DB::transaction(function () use ($data) {
            return Lecturer::create($data);
        });
    }

    public function update(int $id, array $data): Lecturer
    {
        return DB::transaction(function () use ($id, $data) {
            $lecturer = Lecturer::findOrFail($id);
            $lecturer->update($data);
            return $lecturer->fresh(['studyProgram']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            Lecturer::destroy($id);
            return true;
        });
    }
}
