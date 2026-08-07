<?php

namespace App\Services;

use App\Models\Student;
use Illuminate\Support\Facades\DB;

class StudentService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Student::all()->loadMissing(['studyProgram', 'lecturer']);
    }

    public function getById(int $id): Student
    {
        return Student::with(['studyProgram', 'lecturer'])->findOrFail($id);
    }

    public function create(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            return Student::create($data);
        });
    }

    public function update(int $id, array $data): Student
    {
        return DB::transaction(function () use ($id, $data) {
            $student = Student::findOrFail($id);
            $student->update($data);
            return $student->fresh(['studyProgram', 'lecturer']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            Student::destroy($id);
            return true;
        });
    }
}
