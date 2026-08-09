<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Student::with(['user', 'studyProgram'])->get();
    }

    public function getById(int $id): Student
    {
        return Student::with(['user', 'studyProgram'])->findOrFail($id);
    }

    public function create(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            // Create user record
            $user = User::create([
                'name' => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
                'password' => Hash::make($data['password'] ?? 'mhs123'), // default for students
                'phone_number' => $data['phone_number'] ?? null,
            ]);

            // Auto-assign role mahasiswa agar user langsung dapat permission yang sesuai
            // (kp.kelompok.create, kp.logbook.input, ta.pengajuan.create, dst.)
            $user->syncRoles(['mahasiswa']);

            // Create student record linked to user
            return Student::create([
                'user_id' => $user->id,
                'nim' => $data['nim'],
                'study_program_id' => $data['study_program_id'],
                'is_active' => $data['is_active'] ?? true,
            ]);
        });
    }

    public function update(int $id, array $data): Student
    {
        return DB::transaction(function () use ($id, $data) {
            $student = Student::findOrFail($id);

            // Update student fields
            $student->update([
                'nim' => $data['nim'],
                'study_program_id' => $data['study_program_id'],
                'is_active' => $data['is_active'] ?? $student->is_active,
            ]);

            // Update related user record
            if ($student->user) {
                $student->user->update([
                    'name' => $data['name'] ?? $student->user->name,
                    'email' => $data['email'] ?? $student->user->email,
                    'phone_number' => $data['phone_number'] ?? $student->user->phone_number,
                ]);
            }

            return $student->fresh(['user', 'studyProgram']);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $student = Student::findOrFail($id);
            // Delete related user as well
            if ($student->user) {
                $student->user->delete();
            }
            $student->delete();
            return true;
        });
    }
}
