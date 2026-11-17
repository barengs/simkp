<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Lecturer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LecturerSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // 1. Pastikan user demo dosen memiliki profil Lecturer
        $demoDosenUser = User::where('email', 'dosen@simkpta.test')->first();
        if ($demoDosenUser) {
            Lecturer::updateOrCreate(
                ['user_id' => $demoDosenUser->id],
                [
                    'nip' => '19851117' . $now->year . '1001',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $lecturersData = [
            ['name' => 'Dr. Budi Sudaryono, M.Kom.', 'nip' => '19750312' . $now->year . '1001', 'email' => 'budi.sudaryono@univ.ac.id'],
            ['name' => 'Prof. Maya Setiawan, Ph.D.', 'nip' => '19681120' . $now->year . '2001', 'email' => 'maya.setiawan@univ.ac.id'],
            ['name' => 'Hendra Prasetyo, S.Kom., M.T.', 'nip' => '19820514' . $now->year . '1002', 'email' => 'hendra.prasetyo@univ.ac.id'],
            ['name' => 'Siti Nurul Hidayat, M.Cs.', 'nip' => '19880925' . $now->year . '2002', 'email' => 'siti.nurul@univ.ac.id'],
            ['name' => 'Rudi Gunawan, M.T.', 'nip' => '19790408' . $now->year . '1003', 'email' => 'rudi.gunawan@univ.ac.id'],
            ['name' => 'Intan Permadi, S.Kom., M.Kom.', 'nip' => '19900218' . $now->year . '2003', 'email' => 'intan.permadi@univ.ac.id'],
            ['name' => 'Agus Santoso, M.Kom.', 'nip' => '19830830' . $now->year . '1004', 'email' => 'agus.santoso@univ.ac.id'],
            ['name' => 'Diana Anggraini, S.T., M.Sc.', 'nip' => '19861212' . $now->year . '2004', 'email' => 'diana.anggraini@univ.ac.id'],
            ['name' => 'Fajar Mulyadi, M.Kom.', 'nip' => '19810705' . $now->year . '1005', 'email' => 'fajar.mulyadi@univ.ac.id'],
            ['name' => 'Lestari Kusuma, Ph.D.', 'nip' => '19741019' . $now->year . '2005', 'email' => 'lestari.kusuma@univ.ac.id'],
        ];

        foreach ($lecturersData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password123'),
                    'phone_number' => '0812' . rand(10000000, 99999999),
                    'email_verified_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            Lecturer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nip' => $data['nip'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $user->syncRoles(['dosen']);
        }

        $this->command->info(count($lecturersData) + 1 . ' lecturers created successfully with current timestamp!');
    }
}
