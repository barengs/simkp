<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Period;
use App\Models\Student;
use App\Models\Lecturer;

class SystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeder ini HANYA memastikan periode aktif tersedia dan
     * menyelaraskan mahasiswa/dosen ke periode tersebut.
     * TIDAK membuat kelompok KP / logbook / laporan apa pun.
     */
    public function run(): void
    {
        // 1. Ensure Active Period exists
        $period = Period::where('is_active', true)->first();
        if (!$period) {
            $period = Period::create([
                'academic_year' => '2025/2026',
                'semester' => 'ganjil',
                'start_date' => now(),
                'end_date' => now()->addMonths(6),
                'is_active' => true,
            ]);
        }

        // 2. Align all students and lecturers to this period for isolation testing
        // Use withoutGlobalScopes to catch students/lecturers from other periods
        Student::withoutGlobalScopes()->update(['period_id' => $period->id]);
        Lecturer::withoutGlobalScopes()->update(['period_id' => $period->id]);

        // 3. Pastikan minimal ada 1 tema & 1 mitra (master data pendukung)
        \App\Models\Theme::firstOrCreate(
            ['name' => 'Pengembangan Sistem Informasi', 'period_id' => $period->id],
            ['year' => $period->academic_year, 'is_active' => true]
        );

        \App\Models\Company::firstOrCreate(
            ['name' => 'PT Digital Solusi Utama', 'period_id' => $period->id],
            [
                'address' => 'Jl. Merdeka No. 123, Jakarta',
                'contact_person' => 'Dian Pratama',
                'phone' => '021-1234567',
                'is_verified' => true
            ]
        );

        $this->command->info('✅ SystemSeeder: master data siap, tanpa kelompok KP untuk mahasiswa.');
    }
}
