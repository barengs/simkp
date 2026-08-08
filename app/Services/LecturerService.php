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
        return Lecturer::with('user')->get();
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

            // Create lecturer record linked to user
            return Lecturer::create([
                'user_id' => $user->id,
                'nip' => $data['nip'],
                'nidn' => $data['nidn'] ?? null,
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
                'nidn' => $data['nidn'] ?? $lecturer->nidn,
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
