<?php

namespace App\Services;

use App\Models\Lecturer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LecturerService
{
    public function getAllLecturers()
    {
        return Lecturer::with('user:id,name,email')->latest()->get();
    }

    public function createLecturer(array $data)
    {
        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('dosen123'),
                'role' => 'dosen_pembimbing',
            ]);

            // Create lecturer record
            $lecturer = Lecturer::create([
                'user_id' => $user->id,
                'nip' => $data['nip'],
                'phone' => $data['phone'],
            ]);

            DB::commit();
            return $lecturer;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create lecturer: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateLecturer(Lecturer $lecturer, array $data)
    {
        DB::beginTransaction();
        try {
            if ($lecturer->user) {
                $lecturer->user->update([
                    'name' => $data['name'],
                    'email' => $data['email'],
                ]);
            }

            $lecturer->update([
                'nip' => $data['nip'],
                'phone' => $data['phone'],
            ]);

            DB::commit();
            return $lecturer;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update lecturer: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteLecturer(Lecturer $lecturer)
    {
        DB::beginTransaction();
        try {
            if ($lecturer->user) {
                $lecturer->user->delete(); // Cascades to lecturer
            } else {
                $lecturer->delete();
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete lecturer: ' . $e->getMessage());
            throw $e;
        }
    }

    public function resetPassword(Lecturer $lecturer)
    {
        if (!$lecturer->user) {
            throw new \Exception('User data not found.');
        }

        $lecturer->user->update([
            'password' => Hash::make('dosen123'),
        ]);

        return true;
    }
}
