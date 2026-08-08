<?php

namespace Database\Seeders;

use App\Models\StudyProgram;
use App\Models\Institution;
use Illuminate\Database\Seeder;

class StudyProgramSeeder extends Seeder
{
    public function run(): void
    {
        $institution = Institution::first() ?? Institution::create([
            'name' => 'Universitas Indonesia',
            'abbreviation' => 'UI',
            'address' => 'Jl. Raya Campus, Depok',
        ]);

        $programs = [
            ['name' => 'Teknik Informatika', 'code' => 'TI', 'description' => 'Program Studi Teknik Informatika'],
            ['name' => 'Sistem Informasi', 'code' => 'SI', 'description' => 'Program Studi Sistem Informasi'],
            ['name' => 'Matematika', 'code' => 'MTK', 'description' => 'Program Studi Matematika'],
            ['name' => 'Ilmu Komputer', 'code' => 'IK', 'description' => 'Program Studi Ilmu Komputer'],
            ['name' => 'Pendidikan Teknik Informatika', 'code' => 'PTI', 'description' => 'Pendidikan Teknik Informatika'],
            ['name' => 'Agribisnis', 'code' => 'AGB', 'description' => 'Program Studi Agribisnis'],
            ['name' => 'Ekonomi Bisnis', 'code' => 'EB', 'description' => 'Program Studi Ekonomi Bisnis'],
            ['name' => 'Manajemen', 'code' => 'MAN', 'description' => 'Program Studi Manajemen'],
            ['name' => 'Pendidikan Bahasa Inggris', 'code' => 'BING', 'description' => 'Pendidikan Bahasa Inggris'],
            ['name' => 'Teknik Elektro', 'code' => 'TE', 'description' => 'Program Studi Teknik Elektro'],
        ];

        foreach ($programs as $program) {
            StudyProgram::create(array_merge($program, [
                'institution_id' => $institution->id,
            ]));
        }

        $this->command->info('Study programs created successfully!');
    }
}
