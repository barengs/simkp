<?php

namespace App\Services;

use App\Models\Internship;
use App\Models\Student;
use App\Models\Logbook;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getAdminStats()
    {
        $totalStudents = Student::count();

        // Single query for all internship status counts (was 3 separate queries)
        $counts = Internship::selectRaw("
            COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'finished' THEN 1 END) as finished
        ")->first();

        $approvedInternships = $counts->approved;
        $pendingInternships = $counts->pending;
        $finishedInternships = $counts->finished;

        // Monthly trends (last 6 months)
        $monthlyTrends = Internship::select(
            DB::raw('count(id) as count'),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month")
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Recent activities
        $recentActivities = Internship::with(['leader.user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($internship) {
                return [
                    'id' => $internship->id,
                    'name' => $internship->leader->user->name ?? 'Unknown',
                    'status' => $this->formatStatus($internship->status),
                    'date' => $internship->created_at->format('Y-m-d'),
                    'type' => 'Pendaftaran'
                ];
            });

        return [
            'stats' => [
                ['name' => 'Total Mahasiswa', 'value' => $totalStudents, 'change' => '+0%', 'changeType' => 'positive'],
                ['name' => 'Pendaftaran Disetujui', 'value' => $approvedInternships, 'change' => '+0%', 'changeType' => 'positive'],
                ['name' => 'Menunggu Validasi', 'value' => $pendingInternships, 'change' => '+0%', 'changeType' => 'neutral'],
                ['name' => 'Selesai KP', 'value' => $finishedInternships, 'change' => '+0%', 'changeType' => 'positive'],
            ],
            'monthlyTrends' => $monthlyTrends,
            'recentActivities' => $recentActivities
        ];
    }

    private function formatStatus($status)
    {
        $map = [
            'submitted' => 'Menunggu Validasi',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'ongoing' => 'Pelaksanaan',
            'grading' => 'Penilaian',
            'finished' => 'Selesai'
        ];
        return $map[$status] ?? $status;
    }
}
