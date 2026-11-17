<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\StudyProgram;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $studyPrograms = StudyProgram::all();

        if ($studyPrograms->isEmpty()) {
            $this->command->warn('No study programs found. Skipping StudentSeeder.');
            return;
        }

        $defaultProgram = $studyPrograms->first();

        // 1. Pastikan user demo mahasiswa memiliki profil Student
        $demoMhsUser = User::where('email', 'mahasiswa@simkpta.test')->first();
        if ($demoMhsUser) {
            Student::updateOrCreate(
                ['user_id' => $demoMhsUser->id],
                [
                    'nim' => $now->year . $now->format('m') . '0001',
                    'is_active' => true,
                    'study_program_id' => $defaultProgram->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $studentsData = [
            ['name' => 'Sukma Setiawan', 'nim' => $now->year . $now->format('m') . '0002', 'email' => 'sukma.setiawan@univ.ac.id'],
            ['name' => 'Ahmad Wijaya', 'nim' => $now->year . $now->format('m') . '0003', 'email' => 'ahmad.wijaya@univ.ac.id'],
            ['name' => 'Siti Nurhaliza', 'nim' => $now->year . $now->format('m') . '0004', 'email' => 'siti.nurhaliza@univ.ac.id'],
            ['name' => 'Budi Prasetyo', 'nim' => $now->year . $now->format('m') . '0005', 'email' => 'budi.prasetyo@univ.ac.id'],
            ['name' => 'Maya Kumalasari', 'nim' => $now->year . $now->format('m') . '0006', 'email' => 'maya.kumala@univ.ac.id'],
            ['name' => 'Rudi Santoso', 'nim' => $now->year . $now->format('m') . '0007', 'email' => 'rudi.santoso@univ.ac.id'],
            ['name' => 'Sari Hidayat', 'nim' => $now->year . $now->format('m') . '0008', 'email' => 'sari.hidayat@univ.ac.id'],
            ['name' => 'Joko Nugroho', 'nim' => $now->year . $now->format('m') . '0009', 'email' => 'joko.nugroho@univ.ac.id'],
            ['name' => 'Intan Anggraini', 'nim' => $now->year . $now->format('m') . '0010', 'email' => 'intan.anggraini@univ.ac.id'],
            ['name' => 'Dedi Permadi', 'nim' => $now->year . $now->format('m') . '0011', 'email' => 'dedi.permadi@univ.ac.id'],
            ['name' => 'Rina Gunawan', 'nim' => $now->year . $now->format('m') . '0012', 'email' => 'rina.gunawan@univ.ac.id'],
            ['name' => 'Fajar Zulkifli', 'nim' => $now->year . $now->format('m') . '0013', 'email' => 'fajar.zulkifli@univ.ac.id'],
            ['name' => 'Nurul Habibah', 'nim' => $now->year . $now->format('m') . '0014', 'email' => 'nurul.habibah@univ.ac.id'],
            ['name' => 'Prasetyo Ali', 'nim' => $now->year . $now->format('m') . '0015', 'email' => 'prasetyo.ali@univ.ac.id'],
            ['name' => 'Diana Firmansyah', 'nim' => $now->year . $now->format('m') . '0016', 'email' => 'diana.firmansyah@univ.ac.id'],
            ['name' => 'Rahmat Hidayat', 'nim' => $now->year . $now->format('m') . '0017', 'email' => 'rahmat.hidayat@univ.ac.id'],
            ['name' => 'Wulandari Kusuma', 'nim' => $now->year . $now->format('m') . '0018', 'email' => 'wulandari.kusuma@univ.ac.id'],
            ['name' => 'Didi Mulyadi', 'nim' => $now->year . $now->format('m') . '0019', 'email' => 'didi.mulyadi@univ.ac.id'],
            ['name' => 'Fatma Ratu', 'nim' => $now->year . $now->format('m') . '0020', 'email' => 'fatma.ratu@univ.ac.id'],
            ['name' => 'Yusuf Ibrahim', 'nim' => $now->year . $now->format('m') . '0021', 'email' => 'yusuf.ibrahim@univ.ac.id'],
        ];

        foreach ($studentsData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('mhs123'),
                    'phone_number' => '0857' . rand(10000000, 99999999),
                    'email_verified_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            Student::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nim' => $data['nim'],
                    'is_active' => true,
                    'study_program_id' => $studyPrograms->random()->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $user->syncRoles(['mahasiswa']);
        }

        $this->command->info(count($studentsData) + 1 . ' students created successfully with current timestamp and NIM prefix ' . $now->year . $now->format('m') . '!');
    }
}
