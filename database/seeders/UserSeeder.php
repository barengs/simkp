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

        // Dosen (3 dosen)
        $dosenData = [
            ['name' => 'Rofiuddin, S.Kom, M.Kom', 'email' => 'kambing@gmail.com'],
            ['name' => 'Miftahul walid, S.Kom, M.Kom', 'email' => 'walid@gmail.com'],
            ['name' => 'Aminullah Hamzah, S.Kom, M.Kom', 'email' => 'hamzah@gmail.com'],
        ];

        foreach ($dosenData as $dosen) {
            User::updateOrCreate(
                ['email' => $dosen['email']],
                [
                    'name' => $dosen['name'],
                    'password' => Hash::make('dosen123'),
                    'role' => 'dosen',
                ]
            );
        }

        // Mahasiswa (5 mahasiswa)
        $mahasiswaData = [
            ['name' => 'Alfiansyah', 'email' => 'alfin@gmail.com'],
            ['name' => 'Wahyu Aulia', 'email' => 'ghea@gmail.com'],
            ['name' => 'Miladi Mubarok', 'email' => 'miladi@gmail.com'],
            ['name' => 'Fikri', 'email' => 'fikri@gmail.com'],
            ['name' => 'Hamid', 'email' => 'hamid@gmail.com'],
        ];

        foreach ($mahasiswaData as $mhs) {
            User::updateOrCreate(
                ['email' => $mhs['email']],
                [
                    'name' => $mhs['name'],
                    'password' => Hash::make('mhs123'),
                    'role' => 'mahasiswa',
                ]
            );
        }

        $this->command->info('✅ Seeded: 1 Admin, 3 Dosen, 5 Mahasiswa (password: "password")');
    }
}
