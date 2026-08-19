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
        return Student::select(['id', 'user_id', 'nim', 'study_program_id', 'is_active'])
            ->with([
                'user' => function ($q) {
                    $q->select(['id', 'name', 'email', 'phone_number', 'profile_picture_url']);
                },
                'studyProgram' => function ($q) {
                    $q->select(['id', 'name']);
                }
            ])
            ->get();
    }

    public function getPaginated(array $params)
    {
        $studentTable = (new Student)->getTable();
        $query = Student::query()
            ->select(["{$studentTable}.id", "{$studentTable}.user_id", "{$studentTable}.nim", "{$studentTable}.study_program_id", "{$studentTable}.is_active"])
            ->with([
                'user' => function ($q) {
                    $q->select(['id', 'name', 'email', 'phone_number', 'profile_picture_url']);
                },
                'studyProgram' => function ($q) {
                    $q->select(['id', 'name']);
                }
            ]);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search, $studentTable) {
                $q->where("{$studentTable}.nim", 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('studyProgram', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Study Program
        if (!empty($params['study_program_id'])) {
            $query->where("{$studentTable}.study_program_id", $params['study_program_id']);
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortDirection = $params['sort_direction'] ?? 'asc';
        $allowedSorts = ['nim', 'name', 'email', 'study_program_id'];

        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'name' || $sortBy === 'email') {
                $query->join('users', 'student.user_id', '=', 'users.id')
                    ->orderBy("users.{$sortBy}", $sortDirection);
            } else {
                $query->orderBy("students.{$sortBy}", $sortDirection);
            }
        }

        // Check if options are requested
        if (isset($params['type']) && $params['type'] === 'options') {
            return $query->get();
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
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
            // (kp.pendaftaran-kelompok, kp.logbook, ta.pengajuan, dst.)
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
