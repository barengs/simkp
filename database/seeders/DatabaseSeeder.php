<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles, permissions, dan demo users
        $this->call(RolePermissionSeeder::class);
        $this->call(RoleManagementSeeder::class);

        // 2. Institusi & Program Studi
        $this->call(InstitutionSeeder::class);
        $this->call(StudyProgramSeeder::class);

        // 3. Periode Akademik (tahun ini & bulan ini aktif)
        $this->call(AcademicPeriodSeeder::class);

        // 4. Tipe Dokumen Persyaratan
        $this->call(DocumentTypeSeeder::class);

        // 5. Tema & Mitra KP
        $this->call(KpThemeSeeder::class);
        $this->call(KpCompanySeeder::class);

        // 6. Dosen & Mahasiswa (Master Data Pengguna)
        $this->call(LecturerSeeder::class);
        $this->call(StudentSeeder::class);

        // 7. Pengaturan Sistem
        $this->call(SettingSeeder::class);
        $this->call(ApplicationSettingSeeder::class);
    }
}
