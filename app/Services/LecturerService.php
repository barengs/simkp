<?php

namespace App\Services;

use App\Models\Lecturer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LecturerService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Lecturer::select(['id', 'user_id', 'nip'])
            ->with(['user' => function ($q) {
                $q->select(['id', 'name', 'email', 'phone_number', 'profile_picture_url']);
            }])
            ->get();
    }

    public function getPaginated(array $params)
    {
        $lecturerTable = (new Lecturer)->getTable();
        $query = Lecturer::query()
            ->select(["{$lecturerTable}.id", "{$lecturerTable}.user_id", "{$lecturerTable}.nip"])
            ->with(['user' => function ($q) {
                $q->select(['id', 'name', 'email', 'phone_number', 'profile_picture_url']);
            }]);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search, $lecturerTable) {
                $q->where("{$lecturerTable}.nip", 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortDirection = $params['sort_direction'] ?? 'asc';
        $allowedSorts = ['nip', 'name', 'email'];

        if (in_array($sortBy, $allowedSorts)) {
            $lecturerTable = $query->getModel()->getTable();
            if ($sortBy === 'name' || $sortBy === 'email') {
                $query->join('users', "{$lecturerTable}.user_id", '=', 'users.id')
                    ->orderBy("users.{$sortBy}", $sortDirection);
            } else {
                $query->orderBy("{$lecturerTable}.{$sortBy}", $sortDirection);
            }
        }

        // Check if we want all records for select dropdowns
        if (isset($params['type']) && $params['type'] === 'options') {
            return $query->get();
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
    }

    public function getById(int $id): Lecturer
    {
        return Lecturer::with('user')->findOrFail($id);
    }

    public function create(array $data): Lecturer
    {
        return DB::transaction(function () use ($data) {
            // Create user record
            $user = User::create([
                'name' => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
                'password' => Hash::make($data['password'] ?? 'dosen123'), // default for lecturers
                'phone_number' => $data['phone_number'] ?? null,
            ]);

            // Auto-assign role dosen agar user langsung dapat permission yang sesuai
            // (kp.validasi-logbook, kp.validasi-laporan, kp.nilai, ta.*, dst.)
            $user->syncRoles(['dosen']);

            // Create lecturer record linked to user
            return Lecturer::create([
                'user_id' => $user->id,
                'nip' => $data['nip'],
            ]);
        });
    }

    public function update(int $id, array $data): Lecturer
    {
        return DB::transaction(function () use ($id, $data) {
            $lecturer = Lecturer::findOrFail($id);

            // Update lecturer fields
            $lecturer->update([
                'nip' => $data['nip'],
            ]);

            // Update related user record
            if ($lecturer->user) {
                $lecturer->user->update([
                    'name' => $data['name'] ?? $lecturer->user->name,
                    'email' => $data['email'] ?? $lecturer->user->email,
                    'phone_number' => $data['phone_number'] ?? $lecturer->user->phone_number,
                ]);
            }

            return $lecturer->fresh('user');
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $lecturer = Lecturer::findOrFail($id);
            // Delete related user as well
            if ($lecturer->user) {
                $lecturer->user->delete();
            }
            $lecturer->delete();
            return true;
        });
    }
}
