<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator SIMKP',
                'password' => Hash::make('uimpass123'),
                'role' => 'admin',
            ]
        );

        // Dosen
        User::updateOrCreate(
            ['email' => 'dosen@gmail.com'],
            [
                'name' => 'Rofiuddin, S.Kom, M.Kom',
                'password' => Hash::make('uimpass123'),
                'role' => 'dosen',
            ]
        );

        // Mahasiswa
        User::updateOrCreate(
            ['email' => 'mahasiswa@gmail.com'],
            [
                'name' => 'Alfiansyah',
                'password' => Hash::make('uimpass123'),
                'role' => 'mahasiswa',
            ]
        );
    }
}
