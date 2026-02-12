<?php

namespace App\Services;

use App\Models\Lecturer;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LecturerService
{
    public function getAllLecturers(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Lecturer::select(['id', 'user_id', 'nip', 'phone'])->with('user:id,name,email');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nip', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function createLecturer(array $data): Lecturer
    {
        return DB::transaction(function () use ($data) {
            $user = User::where('email', $data['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role' => 'dosen'
                ]);
            }

            if (Lecturer::where('nip', $data['nip'])->exists()) {
                throw ValidationException::withMessages(['nip' => 'Dosen dengan NIP ini sudah terdaftar di periode ini.']);
            }

            return $user->lecturer()->create([
                'nip' => $data['nip'],
                'phone' => $data['phone'],
            ]);
        });
    }

    public function updateLecturer(Lecturer $lecturer, array $data): Lecturer
    {
        return DB::transaction(function () use ($lecturer, $data) {
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            $lecturer->user->update($userData);

            $lecturer->update([
                'nip' => $data['nip'],
                'phone' => $data['phone'],
            ]);

            return $lecturer;
        });
    }

    public function deleteLecturer(Lecturer $lecturer): void
    {
        $lecturer->delete();
    }
}
