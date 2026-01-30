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
            ['email' => 'admin@university.ac.id'],
            [
                'name' => 'Administrator SIMKP',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Dosen
        User::updateOrCreate(
            ['email' => 'dosen@university.ac.id'],
            [
                'name' => 'Dr. Ahmad Dosen',
                'password' => Hash::make('password'),
                'role' => 'dosen',
            ]
        );

        // Mahasiswa
        User::updateOrCreate(
            ['email' => 'student@university.ac.id'],
            [
                'name' => 'Budi Mahasiswa',
                'password' => Hash::make('password'),
                'role' => 'mahasiswa',
            ]
        );
    }
}
