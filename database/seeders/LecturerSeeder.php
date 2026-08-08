<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Lecturer;
use Illuminate\Database\Seeder;

class LecturerSeeder extends Seeder
{
    public function run(): void
    {
        $firstNames = [
            'Andi', 'Budi', 'Siti', 'Maya', 'Rudi', 'Sari', 'Joko', 'Intan',
            'Dedi', 'Rina', 'Hendra', 'Lestari', 'Agus', 'Sukma', 'Fajar', 'Nurul',
            'Prasetyo', 'Diana', 'Sondhi', 'Wulandari', 'Didi', 'Suhana', 'Ahmad', 'Fatma'
        ];

        $lastNames = [
            'Sudaryono', 'Wijaya', 'Setiawan', 'Prasetyo', 'Kusuma', 'Mulyadi',
            'Santoso', 'Hidayat', 'Ratu', 'Kumalasari', 'Nugroho', 'Anggraini',
            'Permadi', 'Gunawan', 'Habibah', 'Zulkifli', 'Ali', 'Ibrahim'
        ];

        $usedNips = [];
        $usedNidns = [];

        for ($i = 0; $i < 50; $i++) {
            $attempts = 0;
            $name = '';
            do {
                $firstName = $firstNames[array_rand($firstNames)];
                $lastName = $lastNames[array_rand($lastNames)];
                $name = $firstName . ' ' . $lastName;
                $attempts++;
                if ($attempts > 20) {
                    $name = $firstName . ' ' . $lastName . ' ' . ($i + 1);
                    break;
                }
            } while ($name === $firstName . ' ' . $lastNames[array_rand($lastNames)]);

            $nip = '19' . rand(60, 79) . rand(10, 12) . str_pad((string) $i, 4, '0', STR_PAD_LEFT);

            while (in_array($nip, $usedNips)) {
                $nip = '19' . rand(60, 79) . rand(10, 12) . str_pad((string) $i, 4, '0', STR_PAD_LEFT);
            }
            $usedNips[] = $nip;

            $nidn = (string) rand(100000000, 999999999);
            while (in_array($nidn, $usedNidns)) {
                $nidn = (string) rand(100000000, 999999999);
            }
            $usedNidns[] = $nidn;

            $email = 'dosen.' . strtolower(str_replace(' ', '.', $name)) . $i . '@univ.ac.id';
            $phone = '08' . rand(1000000000, 9999999999);
            // $birthDate = now()->subYears(rand(35, 60))->subMonths(rand(0, 11));
            // $gender = rand(0, 1) ? 'male' : 'female';
            // $address = 'Jl. ' . ['Sudirman', 'Melawai', 'Menteng', 'Pandegilan', 'Cikole'][array_rand([
            //     'Sudirman', 'Melawai', 'Menteng', 'Pandegilan', 'Cikole'
            // ])] . ' No. ' . rand(1, 100);

            // Create user first
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => bcrypt('password123'),
                'phone_number' => $phone,
                // 'birth_date' => $birthDate,
                // 'gender' => $gender,
                // 'address' => $address,
            ]);

            // Create lecturer with user_id
            Lecturer::create([
                'user_id' => $user->id,
                'nip' => $nip,
                'nidn' => $nidn,
                // 'office_address' => 'Gedung Fakultas, Lantai ' . rand(1, 5),
                // 'position' => ['Dosen Tetap', 'Guru Besar', 'Asisten Pengajar', 'Lektor'][array_rand([
                //     'Dosen Tetap', 'Guru Besar', 'Asisten Pengajar', 'Lektor'
                // ])],
                // 'expertise' => ['Teknik Informatika', 'Sistem Informasi', 'Matematika', 'Ilmu Komputer'][array_rand([
                //     'Teknik Informatika', 'Sistem Informasi', 'Matematika', 'Ilmu Komputer'
                // ])],
            ]);
        }

        $this->command->info('50 lecturers created successfully!');
    }
}
