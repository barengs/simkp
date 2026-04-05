<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\Logbook;
use App\Models\Period;
use App\Models\Student;
use App\Models\Lecturer;

class SystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
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

        // 3. Ensure Theme and Company exist
        $theme = \App\Models\Theme::firstOrCreate(
            ['name' => 'Pengembangan Sistem Informasi', 'period_id' => $period->id],
            ['year' => $period->academic_year, 'is_active' => true]
        );

        $company = \App\Models\Company::firstOrCreate(
            ['name' => 'PT Digital Solusi Utama', 'period_id' => $period->id],
            [
                'address' => 'Jl. Merdeka No. 123, Jakarta',
                'contact_person' => 'Dian Pratama',
                'phone' => '021-1234567',
                'is_verified' => true
            ]
        );

        // 4. Create Internship Group for Mahasiswa 1
        $student1 = Student::find(1);
        $student2 = Student::find(2);
        $lecturer = Lecturer::find(1);

        if ($student1 && $lecturer) {
            $internship = Internship::firstOrCreate(
                ['leader_id' => $student1->id, 'period_id' => $period->id],
                [
                    'company_id' => $company->id,
                    'theme_id' => $theme->id,
                    'status' => 'approved',
                    'supervisor_id' => $lecturer->id,
                ]
            );

            // 4. Create Internship Members
            InternshipMember::firstOrCreate([
                'internship_id' => $internship->id,
                'student_id' => $student1->id,
            ]);

            if ($student2) {
                InternshipMember::firstOrCreate([
                    'internship_id' => $internship->id,
                    'student_id' => $student2->id,
                ]);
            }

            // 5. Create Logbook
            try {
                Logbook::firstOrCreate(
                    ['internship_id' => $internship->id, 'date' => now()->subDays(1)->format('Y-m-d')],
                    [
                        'activity' => 'Melakukan observasi lapangan di PT Digital Solusi Utama.',
                        'status' => 'approved',
                    ]
                );
            } catch (\Exception $e) {
                // Ignore duplicate
            }

            // 6. Log Activity
            $activityDesc = "Mahasiswa {$student1->user->name} mendaftarkan kelompok KP baru.";
            try {
                \App\Models\Activity::firstOrCreate(
                    ['user_id' => $student1->user->id, 'description' => $activityDesc],
                    [
                        'period_id' => $period->id,
                        'type' => 'registration_submitted',
                    ]
                );
            } catch (\Exception $e) {
                // Ignore duplicate
            }
        }
    }
}
