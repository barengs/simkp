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
        
        // Find periods where today is the announcement date (or passed)
        $periods = Period::where('announcement_date', '<=', $now)->get();

        foreach ($periods as $period) {
            $updatedCount = Internship::where('period_id', $period->id)
                ->where('status', '!=', 'finished')
                ->where('status', '!=', 'rejected')
                ->update(['status' => 'finished']);
            
            if ($updatedCount > 0) {
                $this->info("Updated {$updatedCount} internships to 'finished' for period: {$period->academic_year}");
                Log::info("Auto-finished {$updatedCount} internships for period ID: {$period->id}");
            }
        }

        $this->info('Internship status check completed.');
        return 0;
    }
}
