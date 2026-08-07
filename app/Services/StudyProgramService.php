<?php

namespace App\Services;

use App\Models\StudyProgram;
use Illuminate\Support\Facades\DB;

class StudyProgramService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return StudyProgram::all();
    }

    public function getById(int $id): StudyProgram
    {
        return StudyProgram::findOrFail($id);
    }

    public function create(array $data): StudyProgram
    {
        return DB::transaction(function () use ($data) {
            return StudyProgram::create($data);
        });
    }

    public function update(int $id, array $data): StudyProgram
    {
        return DB::transaction(function () use ($id, $data) {
            $s = StudyProgram::findOrFail($id);
            $s->update($data);
            return $s->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            StudyProgram::destroy($id);
            return true;
        });
    }
}
