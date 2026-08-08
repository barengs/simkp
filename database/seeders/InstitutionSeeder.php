<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    public function run(): void
    {
        $institutions = [
            [
                'name' => 'Universitas Indonesia',
                'abbreviation' => 'UI',
                'accreditation_level' => 'A',
                'address' => 'Jl. Raya Campus, Depok, Jawa Barat',
                'phone_number' => '021-50086',
                'email' => 'info@ui.ac.id',
                'website' => 'https://www.ui.ac.id',
            ],
            [
                'name' => 'Institut Teknologi Bandung',
                'abbreviation' => 'ITB',
                'accreditation_level' => 'A',
                'address' => 'Jl. Ganesha 10, Bandung, Jawa Barat',
                'phone_number' => '022-2051234',
                'email' => 'info@itb.ac.id',
                'website' => 'https://www.itb.ac.id',
            ],
            [
                'name' => 'Universitas Gadjah Mada',
                'abbreviation' => 'UGM',
                'accreditation_level' => 'A',
                'address' => 'Jl. Grafika No. 2, Yogyakarta, Daerah Istimewa Yogyakarta',
                'phone_number' => '0274-372031',
                'email' => 'humas@ugm.ac.id',
                'website' => 'https://www.ugm.ac.id',
            ],
        ];

        foreach ($institutions as $institution) {
            Institution::create($institution);
        }

        $this->command->info('Institutions created successfully!');
    }
}
