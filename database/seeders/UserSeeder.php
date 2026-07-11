<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\Logbook;
use App\Models\Lecturer;
use App\Models\Period;
use App\Models\Report;
use App\Models\Student;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // 1. Create Admin
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator SIMKP',
                'password' => Hash::make('uimpass123'),
                'role' => 'admin',
            ]
        );

        // 2. Create Active Period
        $period = Period::firstOrCreate(
            ['academic_year' => '2025/2026'],
            [
                'semester' => 'ganjil',
                'start_date' => now(),
                'end_date' => now()->addMonths(6),
                'is_active' => true,
            ]
        );

        // 3. Create Companies
        $companyNames = [
            'PT Telkom Indonesia', 'PT Bank Mandiri', 'PT GoTo Gojek Tokopedia', 
            'PT Astra International', 'PT Bukalapak', 'PT Indofood', 
            'PT Pertamina', 'PT PLN', 'PT Kimia Farma', 'PT Semen Indonesia'
        ];
        
        $companyData = [];
        foreach ($companyNames as $name) {
            $companyData[] = Company::create([
                'period_id' => $period->id,
                'name' => $name,
                'address' => $faker->address,
                'contact_person' => $faker->name,
                'phone' => $faker->phoneNumber,
                'is_verified' => true,
            ]);
        }

        // 4. Create Lecturers (15)
        $dosenData = [];
        for ($i = 0; $i < 15; $i++) {
            $name = $faker->name;
            $email = 'dosen' . ($i + 1) . '@uim.ac.id';
            
            $user = User::updateOrCreate(['email' => $email], [
                'name' => $name, 
                'password' => Hash::make('dosen123'), 
                'role' => 'dosen'
            ]);
            
            // GUNAKAN updateOrCreate DI SINI
            $dosenData[] = Lecturer::updateOrCreate(
                ['nip' => '19800101' . str_pad($i + 1, 3, '0')], // Cek berdasarkan NIP
                [
                    'user_id' => $user->id,
                    'phone' => $faker->phoneNumber,
                    'period_id' => $period->id,
                ]
            );
        }

        // 5. Create Students (50)
        $mahasiswaData = [];
        $majors = ['Sistem Informasi', 'Teknik Informatika', 'Sistem Komputer'];
        
        for ($i = 0; $i < 50; $i++) {
            $nim = '2023' . str_pad($i + 1, 3, '0');
            $user = User::updateOrCreate(
                ['email' => 'mhs' . $nim . '@student.unikom.ac.id'],
                [
                    'name' => $faker->name,
                    'password' => Hash::make('mhs123'),
                    'role' => 'mahasiswa',
                ]
            );
            
            $mahasiswaData[] = Student::updateOrCreate(['nim' => $nim], [
                'user_id' => $user->id,
                'major' => $majors[array_rand($majors)],
                'batch_year' => '2023',
                'phone' => $faker->phoneNumber,
                'period_id' => $period->id,
            ]);
        }

        // 6. Create Themes (20)
        $themeData = [];
        $prefixes = ['Pengembangan Web', 'Data Science', 'Network Security', 'Mobile App', 'AI Research'];
        for ($i = 0; $i < 20; $i++) {
            $themeData[] = Theme::create([
                'period_id' => $period->id, 
                'name' => $prefixes[array_rand($prefixes)] . ' ' . ($i + 1), 
                'year' => '2025', 
                'is_active' => true
            ]);
        }

        // 7. Create Internships (15)
        $statuses = ['ongoing', 'finished', 'grading'];
        foreach (range(1, 15) as $i) {
            $internship = Internship::create([
                'leader_id' => $mahasiswaData[array_rand($mahasiswaData)]->id,
                'supervisor_id' => $dosenData[array_rand($dosenData)]->id,
                'theme_id' => $themeData[array_rand($themeData)]->id,
                'company_id' => $companyData[array_rand($companyData)]->id,
                'period_id' => $period->id,
                'status' => $statuses[array_rand($statuses)],
                'started_at' => now()->subMonths(2),
                'ended_at' => now()->addMonths(1),
            ]);

            // Add Logbooks
            Logbook::create([
                'internship_id' => $internship->id,
                'date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                'activity' => 'Melaporkan progres kegiatan di ' . $internship->theme->name,
                'status' => 'approved',
                'attachment' => null,
            ]);

            // Add Reports
            Report::create([
                'internship_id' => $internship->id,
                'file_url' => 'laporan_' . $internship->id . '.pdf',
                'title' => 'Laporan Akhir ' . $internship->theme->name,
                'description' => 'Laporan lengkap kegiatan KP di perusahaan mitra.',
                'status' => 'approved',
            ]);
        }

        $this->command->info('✅ Seeding selesai! Data terlihat profesional.');
    }
}