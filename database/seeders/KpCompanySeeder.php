<?php

namespace Database\Seeders;

use App\Models\KpCompany;
use Illuminate\Database\Seeder;

class KpCompanySeeder extends Seeder
{
    public function run(): void
    {
        $industries = [
            'Teknologi Informasi',
            'Manufaktur',
            'Pendidikan',
            'Kesehatan',
            'Keuangan',
            'Logistik',
            'Konstruksi',
            'Energi',
            'Agro',
            'Ritel'
        ];

        for ($i = 1; $i <= 30; $i++) {
            KpCompany::create([
                'name' => 'PT Mitra KP ' . $i . ' (' . $industries[array_rand($industries)] . ')',
                'address' => 'Jl. ' . ['Serabaj', 'Negara', 'Gajah', 'Mangunkusumo', 'Ujang', 'Cikini'][array_rand([
                    'Serabaj', 'Negara', 'Gajah', 'Mangunkusumo', 'Ujang', 'Cikini'
                ])] . ' No. ' . rand(1, 200) . ', Jakarta',
                'contact_person' => ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis'][array_rand([
                    'John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis'
                ])] . ' ' . $i,
                'phone_number' => '021-' . rand(50000000, 99999999),
                'email' => 'contact' . $i . '@mitra-kp.co.id',
                'website' => 'https://www.mitra-kp-' . $i . '.co.id',
                'description' => 'Perusahaan mitra untuk program kerja praktikum mahasiswa. Industri: ' . $industries[array_rand($industries)],
            ]);
        }

        $this->command->info('30 KP companies (Mitra) created successfully!');
    }
}
