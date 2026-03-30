<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed users for all three roles.
     */
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('uimpass123'),
                'role' => 'admin',
            ]
        );

        // Ensure Period exists
        $period = \App\Models\Period::where('is_active', true)->first();
        if (!$period) {
            $period = \App\Models\Period::firstOrCreate(
                ['academic_year' => '2025/2026', 'semester' => 'ganjil'],
                [
                    'start_date' => now()->startOfYear(),
                    'end_date' => now()->endOfYear(),
                    'is_active' => true,
                ]
            );
        }

        // Dosen (3 dosen)
        $dosenData = [
            ['name' => 'Rofiuddin, S.Kom, M.Kom', 'email' => 'kambing@gmail.com', 'nip' => '11111111101'],
            ['name' => 'Miftahul walid, S.Kom, M.Kom', 'email' => 'walid@gmail.com', 'nip' => '22222222202'],
            ['name' => 'Aminullah Hamzah, S.Kom, M.Kom', 'email' => 'hamzah@gmail.com', 'nip' => '33333333303'],
        ];

        foreach ($dosenData as $dosen) {
            $user = User::updateOrCreate(
                ['email' => $dosen['email']],
                [
                    'name' => $dosen['name'],
                    'password' => Hash::make('dosen123'),
                    'role' => 'dosen',
                ]
            );

            \App\Models\Lecturer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nip' => $dosen['nip'],
                    'phone' => '08123456' . rand(1000, 9999),
                    'period_id' => $period->id,
                ]
            );
        }

        // Mahasiswa (5 mahasiswa)
        $mahasiswaData = [
            ['name' => 'Alfiansyah', 'email' => 'alfin@gmail.com', 'nim' => '2023001'],
            ['name' => 'Wahyu Aulia', 'email' => 'ghea@gmail.com', 'nim' => '2023002'],
            ['name' => 'Miladi Mubarok', 'email' => 'miladi@gmail.com', 'nim' => '2023003'],
            ['name' => 'Fikri', 'email' => 'fikri@gmail.com', 'nim' => '2023004'],
            ['name' => 'Hamid', 'email' => 'hamid@gmail.com', 'nim' => '2023005'],
        ];

        foreach ($mahasiswaData as $mhs) {
            $user = User::updateOrCreate(
                ['email' => $mhs['email']],
                [
                    'name' => $mhs['name'],
                    'password' => Hash::make('mhs123'),
                    'role' => 'mahasiswa',
                ]
            );

            \App\Models\Student::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nim' => $mhs['nim'],
                    'major' => 'Sistem Informasi',
                    'batch_year' => '2023',
                    'phone' => '08523456' . rand(1000, 9999),
                    'period_id' => $period->id,
                ]
            );
        }

        $this->command->info('✅ Seeded: 1 Admin, 3 Dosen, 5 Mahasiswa (password: "password")');
    }
}
