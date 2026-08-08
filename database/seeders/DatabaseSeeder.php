<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles, permissions and demo users
        $this->call(RolePermissionSeeder::class);

        // Seed institutions (Indonesian universities)
        $this->call(InstitutionSeeder::class);

        // Seed study programs (Indonesian program names)
        $this->call(StudyProgramSeeder::class);

        // Seed academic periods (KP registration periods)
        $this->call(AcademicPeriodSeeder::class);

        // Seed KP themes
        $this->call(KpThemeSeeder::class);

        // Seed KP partners (Mitra)
        $this->call(KpCompanySeeder::class);

        // Seed lecturers (Indonesian names)
        $this->call(LecturerSeeder::class);

        // Seed students (Indonesian names)
        $this->call(StudentSeeder::class);

        // Seed remaining master data
        $this->call(SettingSeeder::class);
        $this->call(ApplicationSettingSeeder::class);
    }
}
