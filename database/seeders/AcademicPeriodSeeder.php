<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use Illuminate\Database\Seeder;

class AcademicPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $periods = [
            [
                'name' => 'Ganjil 2024/2025',
                'start_date' => '2024-07-01',
                'end_date' => '2024-12-31',
                'is_active' => true,
            ],
            [
                'name' => 'Genap 2024/2025',
                'start_date' => '2024-01-01',
                'end_date' => '2024-06-30',
                'is_active' => false,
            ],
            [
                'name' => 'Ganjil 2025/2026',
                'start_date' => '2025-07-01',
                'end_date' => '2025-12-31',
                'is_active' => false,
            ],
            [
                'name' => 'Genap 2025/2026',
                'start_date' => '2025-01-01',
                'end_date' => '2025-06-30',
                'is_active' => false,
            ],
            [
                'name' => 'Pendek 2024/Ekspansi',
                'start_date' => '2024-10-01',
                'end_date' => '2024-12-15',
                'is_active' => false,
            ],
        ];

        foreach ($periods as $period) {
            AcademicPeriod::create($period);
        }

        $this->command->info('5 academic periods created successfully!');
    }
}
