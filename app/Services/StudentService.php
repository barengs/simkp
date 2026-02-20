<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class StudentService
{
    public function getAllStudents()
    {
        $activePeriod = \App\Models\Period::where('is_active', true)->first();

        if (!$activePeriod) {
            return collect();
        }

        return Student::with(['user:id,name,email'])
            ->where('period_id', $activePeriod->id)
            ->select('id', 'user_id', 'period_id', 'nim', 'major', 'batch_year', 'phone')
            ->latest()
            ->get();
    }

    public function createStudent(array $data)
    {
        DB::beginTransaction();
        try {
            // Create User first with default password 'mhs123'
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('mhs123'),
                'role' => 'mahasiswa',
            ]);

            // Create Student linked to User
            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            if (!$activePeriod) {
                throw new \Exception('Tidak ada periode aktif saat ini.');
            }

            $data['user_id'] = $user->id;
            $data['period_id'] = $activePeriod->id;
            $student = Student::create($data);

            DB::commit();
            return $student;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create student: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateStudent(Student $student, array $data)
    {
        DB::beginTransaction();
        try {
            // Update linked User
            if ($student->user) {
                $student->user->update([
                    'name' => $data['name'],
                    'email' => $data['email'],
                ]);
            }

            // Update Student
            $student->update($data);

            DB::commit();
            return $student;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update student: ' . $e->getMessage());
            throw $e;
        }
    }

    public function resetPassword(Student $student)
    {
        if (!$student->user) {
            throw new \Exception('User tidak ditemukan untuk mahasiswa ini.');
        }

        $student->user->update([
            'password' => Hash::make('mhs123'),
        ]);

        return $student;
    }

    public function deleteStudent(Student $student)
    {
        DB::beginTransaction();
        try {
            if ($student->user) {
                $student->user->delete(); // Cascades to student
            } else {
                $student->delete();
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete student: ' . $e->getMessage());
            throw $e;
        }
    }
}
