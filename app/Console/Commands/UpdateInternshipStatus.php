<?php

namespace App\Console\Commands;

use App\Models\Period;
use App\Models\Internship;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateInternshipStatus extends Command
{
    protected $signature = 'internships:update-status';
    protected $description = 'Updates internship statuses to finished when period reaches announcement date';

    public function handle()
    {
        $now = now()->toDateString();
        
        // 1. Transition 'ongoing' to 'grading' when period ends
        $endedPeriods = Period::where('end_date', '<', $now)->get();
        foreach ($endedPeriods as $period) {
            $gradingCount = Internship::where('period_id', $period->id)
                ->where('status', 'ongoing')
                ->update(['status' => 'grading']);
            
            if ($gradingCount > 0) {
                $this->info("Moved {$gradingCount} internships to 'grading' for period: {$period->academic_year}");
                Log::info("Auto-grading {$gradingCount} internships for period ID: {$period->id}");
            }
        }

        // 2. Transition to 'finished' when grades are announced
        $announcedPeriods = Period::where('announcement_date', '<=', $now)->get();
        foreach ($announcedPeriods as $period) {
            $finishedCount = Internship::where('period_id', $period->id)
                ->whereIn('status', ['ongoing', 'grading'])
                ->update(['status' => 'finished']);
            
            if ($finishedCount > 0) {
                $this->info("Completed {$finishedCount} internships for period: {$period->academic_year}");
                Log::info("Auto-finished {$finishedCount} internships for period ID: {$period->id}");
            }
        }

        $this->info('Internship status check completed.');
        return 0;
    }
}
