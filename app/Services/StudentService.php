<?php

namespace App\Services;

use App\Models\InternshipMember;
use App\Models\Student;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class StudentService
{
    public function getAllStudents(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Student::select(['id', 'user_id', 'nim', 'major', 'phone'])->with('user:id,name,email');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nim', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function checkAvailability(string $npm, string $periodId): array
    {
        $student = Student::with('user')->where('nim', $npm)->first();

        if (!$student) {
            throw ValidationException::withMessages(['npm' => 'Mahasiswa tidak ditemukan']);
        }

        $exists = InternshipMember::where('student_id', $student->id)
            ->whereHas('internship', function ($q) use ($periodId) {
                $q->where('period_id', $periodId)
                    ->where('status', '!=', 'rejected');
            })->exists();

        if ($exists) {
            return [
                'message' => 'Mahasiswa sudah terdaftar di kelompok lain pada periode ini',
                'can_join' => false,
                'student' => $student
            ];
        }

        return [
            'message' => 'Mahasiswa tersedia',
            'can_join' => true,
            'student' => $student
        ];
    }

    public function createStudent(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            $user = User::where('email', $data['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role' => 'mahasiswa'
                ]);
            }

            if (Student::where('nim', $data['nim'])->exists()) {
                throw ValidationException::withMessages(['nim' => 'Mahasiswa dengan NIM ini sudah terdaftar di periode ini.']);
            }

            return $user->student()->create([
                'nim' => $data['nim'],
                'major' => $data['major'],
                'batch_year' => $data['batch_year'],
                'phone' => $data['phone'],
            ]);
        });
    }

    public function updateStudent(Student $student, array $data): Student
    {
        return DB::transaction(function () use ($student, $data) {
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            $student->user->update($userData);

            $student->update([
                'nim' => $data['nim'],
                'major' => $data['major'],
                'batch_year' => $data['batch_year'],
                'phone' => $data['phone'],
            ]);

            return $student;
        });
    }

    public function deleteStudent(Student $student): void
    {
        $student->delete();
    }
}
