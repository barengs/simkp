<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AcademicPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $currentYear = $now->year;
        $nextYear = $currentYear + 1;
        $prevYear = $currentYear - 1;

        $periods = [
            [
                'name' => "Ganjil {$currentYear}/{$nextYear}",
                'start_date' => Carbon::create($currentYear, 7, 1)->toDateString(),
                'end_date' => Carbon::create($currentYear, 12, 31)->toDateString(),
                'total_members' => 3,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => "Genap {$currentYear}/{$nextYear}",
                'start_date' => Carbon::create($nextYear, 1, 1)->toDateString(),
                'end_date' => Carbon::create($nextYear, 6, 30)->toDateString(),
                'total_members' => 3,
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => "Genap {$prevYear}/{$currentYear}",
                'start_date' => Carbon::create($currentYear, 1, 1)->toDateString(),
                'end_date' => Carbon::create($currentYear, 6, 30)->toDateString(),
                'total_members' => 3,
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => "Ganjil {$prevYear}/{$currentYear}",
                'start_date' => Carbon::create($prevYear, 7, 1)->toDateString(),
                'end_date' => Carbon::create($prevYear, 12, 31)->toDateString(),
                'total_members' => 3,
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => "Semester Pendek {$currentYear}",
                'start_date' => Carbon::create($currentYear, 7, 1)->toDateString(),
                'end_date' => Carbon::create($currentYear, 8, 31)->toDateString(),
                'total_members' => 3,
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($periods as $period) {
            AcademicPeriod::updateOrCreate(['name' => $period['name']], $period);
        }

        $this->command->info("5 academic periods created successfully for year {$currentYear}!");
    }
}
