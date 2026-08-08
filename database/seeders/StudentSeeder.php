<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\StudyProgram;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $studyPrograms = StudyProgram::all();

        if ($studyPrograms->isEmpty()) {
            $this->command->warn('No study programs found. Skipping StudentSeeder.');
            return;
        }

        $firstNames = [
            'Sukma', 'Hendra', 'Ahmad', 'Siti', 'Budi', 'Maya', 'Rudi', 'Sari',
            'Joko', 'Intan', 'Dedi', 'Rina', 'Agus', 'Fajar', 'Nurul',
            'Prasetyo', 'Diana', 'Rahmat', 'Wulandari', 'Didi', 'Suhana', 'Fatma', 'Yusuf',
        ];

        $lastNames = [
            'Setiawan', 'Wijaya', 'Prasetyo', 'Kusuma', 'Mulyadi', 'Santoso',
            'Hidayat', 'Ratu', 'Kumalasari', 'Nugroho', 'Anggraini', 'Permadi',
            'Gunawan', 'Habibah', 'Zulkifli', 'Ali', 'Ibrahim', 'Firmansyah',
        ];

        $usedNims = [];

        for ($i = 1; $i <= 100; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName . ' ' . $lastName . ' ' . $i;

            $nim = str_pad((string) $i, 8, '0', STR_PAD_LEFT) . str_pad((string) ($i % 100), 2, '0', STR_PAD_LEFT);
            while (in_array($nim, $usedNims, true)) {
                $nim = str_pad((string) rand(1, 99999999), 8, '0', STR_PAD_LEFT) . str_pad((string) rand(0, 99), 2, '0', STR_PAD_LEFT);
            }
            $usedNims[] = $nim;

            $studyProgram = $studyPrograms->random();
            $email = 'mhs.' . strtolower(preg_replace('/\s+/', '.', $firstName . '.' . $lastName)) . $i . '@univ.ac.id';
            $phone = '08' . rand(1000000000, 9999999999);

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => bcrypt('mhs123'),
                'phone_number' => $phone,
            ]);

            Student::create([
                'user_id' => $user->id,
                'nim' => $nim,
                'is_active' => $i % 10 !== 0, // ~90% active
                'study_program_id' => $studyProgram->id,
            ]);
        }

        $this->command->info('100 students created successfully (password: mhs123)!');
    }
}
