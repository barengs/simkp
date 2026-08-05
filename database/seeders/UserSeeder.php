<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Lecturer;
use App\Models\Period;
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

        // ============================================================
        // 1. ADMIN
        // ============================================================
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator SIMKP',
                'password' => Hash::make('uimpass123'),
                'role' => 'admin',
            ]
        );

        // ============================================================
        // 2. PERIODE AKTIF (referensi master data)
        // ============================================================
        $period = Period::firstOrCreate(
            ['academic_year' => '2025/2026'],
            [
                'semester' => 'ganjil',
                'start_date' => now(),
                'end_date' => now()->addMonths(6),
                'is_active' => true,
            ]
        );

        // ============================================================
        // 3. MASTER DATA MITRA (PERUSAHAAN)
        // ============================================================
        $companyNames = [
            'PT Telkom Indonesia', 'PT Bank Mandiri', 'PT GoTo Gojek Tokopedia',
            'PT Astra International', 'PT Bukalapak', 'PT Indofood',
            'PT Pertamina', 'PT PLN', 'PT Kimia Farma', 'PT Semen Indonesia'
        ];

        foreach ($companyNames as $name) {
            Company::updateOrCreate(
                ['name' => $name, 'period_id' => $period->id],
                [
                    'address' => $faker->address,
                    'contact_person' => $faker->name,
                    'phone' => $faker->phoneNumber,
                    'is_verified' => true,
                ]
            );
        }

        // ============================================================
        // 4. AKUN DOSEN (Koordinator TA, Pembimbing, Penguji)
        // ============================================================

        // 4a. Koordinator TA
        $koordinatorTaUser = User::updateOrCreate([
            'email' => 'koordinator.ta@uim.ac.id'
        ], [
            'name' => 'Koordinator TA',
            'password' => Hash::make('dosen123'),
            'role' => 'koordinator_ta',
        ]);

        Lecturer::updateOrCreate([
            'nip' => '19800101000'
        ], [
            'user_id' => $koordinatorTaUser->id,
            'phone' => $faker->phoneNumber,
            'period_id' => $period->id,
        ]);

        // 4b. Dosen Pembimbing (7)
        for ($i = 1; $i <= 7; $i++) {
            $user = User::updateOrCreate([
                'email' => "dosen.pembimbing{$i}@uim.ac.id"
            ], [
                'name' => "Dosen Pembimbing {$i}",
                'password' => Hash::make('dosen123'),
                'role' => 'dosen_pembimbing',
            ]);

            Lecturer::updateOrCreate([
                'nip' => '19800101' . str_pad($i, 3, '0')
            ], [
                'user_id' => $user->id,
                'phone' => $faker->phoneNumber,
                'period_id' => $period->id,
            ]);
        }

        // 4c. Dosen Penguji (7)
        for ($i = 1; $i <= 7; $i++) {
            $user = User::updateOrCreate([
                'email' => "dosen.penguji{$i}@uim.ac.id"
            ], [
                'name' => "Dosen Penguji {$i}",
                'password' => Hash::make('dosen123'),
                'role' => 'dosen_penguji',
            ]);

            Lecturer::updateOrCreate([
                'nip' => '19800201' . str_pad($i, 3, '0')
            ], [
                'user_id' => $user->id,
                'phone' => $faker->phoneNumber,
                'period_id' => $period->id,
            ]);
        }

        // ============================================================
        // 5. AKUN MAHASISWA (50) — HANYA AKUN, TANPA KELOMPOK KP
        // ============================================================
        $majors = ['Sistem Informasi', 'Teknik Informatika', 'Sistem Komputer'];

        for ($i = 1; $i <= 50; $i++) {
            $nim = '2023' . str_pad($i, 3, '0');
            $user = User::updateOrCreate(
                ['email' => 'mhs' . $nim . '@student.unikom.ac.id'],
                [
                    'name' => $faker->name,
                    'password' => Hash::make('mhs123'),
                    'role' => 'mahasiswa',
                ]
            );

            Student::updateOrCreate(['nim' => $nim], [
                'user_id' => $user->id,
                'major' => $majors[array_rand($majors)],
                'batch_year' => '2023',
                'phone' => $faker->phoneNumber,
                'period_id' => $period->id,
            ]);
        }

        // ============================================================
        // 6. MASTER DATA TEMA (20)
        // ============================================================
        $prefixes = ['Pengembangan Web', 'Data Science', 'Network Security', 'Mobile App', 'AI Research'];
        for ($i = 1; $i <= 20; $i++) {
            Theme::updateOrCreate(
                ['name' => $prefixes[array_rand($prefixes)] . ' ' . $i, 'period_id' => $period->id],
                [
                    'year' => '2025',
                    'is_active' => true
                ]
            );
        }

        // ============================================================
        // SELESAI — TIDAK MEMBUAT INTERNSHIP / LOGBOOK / REPORT APA PUN
        // ============================================================
        $this->command->info('✅ Seeding selesai! Hanya akun & master data (tanpa kelompok KP).');
    }
}