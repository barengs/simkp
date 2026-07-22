<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\Period;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get statistics for the dashboard based on roles and active period.
     */
    public function getStats(Request $request)
    {
        $user = $request->user();
        $activePeriod = Period::where('is_active', true)->first();
        
        if (!$activePeriod) {
            return response()->json([
                'stats' => [],
                'chartData' => [],
                'message' => 'Tidak ada periode aktif.'
            ]);
        }

        $periodId = $activePeriod->id;
        $role = $user->role;
        $stats = [];

        if ($user->isAdmin()) {
            // --- Admin Stats (Global) ---
            $stats = [
                'widget1' => ['label' => 'Total Mahasiswa KP', 'value' => Student::whereHas('period', fn($q) => $q->where('is_active', true))->count(), 'icon' => 'users'],
                'widget2' => ['label' => 'Pendaftaran Disetujui', 'value' => Internship::where('period_id', $periodId)->where('status', 'approved')->count(), 'icon' => 'check-circle'],
                'widget3' => ['label' => 'Menunggu Validasi', 'value' => Internship::where('period_id', $periodId)->where('status', 'submitted')->count(), 'icon' => 'clock'],
                'widget4' => ['label' => 'Selesai KP', 'value' => Internship::where('period_id', $periodId)->where('status', 'finished')->count(), 'icon' => 'graduation-cap'],
            ];
        } elseif ($user->isLecturerRole()) {
            // --- Dosen Stats (Supervised) ---
            $lecturer = $user->lecturer;
            $lecturerId = $lecturer?->id;
            
            $stats = [
                'widget1' => ['label' => 'Kelompok Bimbingan', 'value' => $lecturerId ? Internship::where('period_id', $periodId)->where('supervisor_id', $lecturerId)->count() : 0, 'icon' => 'users'],
                'widget2' => ['label' => 'Laporan Perlu Validasi', 'value' => $lecturerId ? \App\Models\Report::whereHas('internship', fn($q) => $q->where('period_id', $periodId)->where('supervisor_id', $lecturerId))->where('status', 'pending')->count() : 0, 'icon' => 'clock'],
                'widget3' => ['label' => 'Logbook Mahasiswa', 'value' => $lecturerId ? \App\Models\Logbook::whereHas('internship', fn($q) => $q->where('period_id', $periodId)->where('supervisor_id', $lecturerId))->count() : 0, 'icon' => 'book-open'],
                'widget4' => ['label' => 'Total Mahasiswa', 'value' => $lecturerId ? \App\Models\InternshipMember::whereHas('internship', fn($q) => $q->where('period_id', $periodId)->where('supervisor_id', $lecturerId))->count() : 0, 'icon' => 'graduation-cap'],
            ];
        } elseif ($user->isStudent()) {
            // --- Student Stats (Personal/Group) ---
            $student = $user->student;
            $internship = $student ? $student->internships()->with('evaluation')->latest()->first() : null;
            $reportStatus = 'Tidak Ada';
            
            if ($internship) {
                $latestReport = $internship->reports()->latest()->first();
                if ($latestReport) {
                    $reportStatus = ucfirst($latestReport->type) . ' (' . ucfirst($latestReport->status) . ')';
                }
            }

            $stats = [
                'widget1' => ['label' => 'Status Pendaftaran', 'value' => $internship ? ucfirst($internship->status) : 'Belum Daftar', 'icon' => 'info'],
                'widget2' => ['label' => 'Total Logbook', 'value' => $internship ? \App\Models\Logbook::where('internship_id', $internship->id)->count() : 0, 'icon' => 'book-open'],
                'widget3' => ['label' => 'Status Laporan', 'value' => $reportStatus, 'icon' => 'file-text'],
                'widget4' => ['label' => 'Nilai Akhir', 'value' => $internship?->evaluation?->final_grade ?? '-', 'icon' => 'award'],
            ];
        }

        // --- Chart Data (Role-Specific) ---
        $chartData = [];
        if ($user->isAdmin()) {
            $chartData = [
                ['name' => 'Menunggu', 'value' => Internship::where('period_id', $periodId)->where('status', 'submitted')->count()],
                ['name' => 'Disetujui', 'value' => Internship::where('period_id', $periodId)->where('status', 'approved')->count()],
                ['name' => 'Berjalan', 'value' => Internship::where('period_id', $periodId)->where('status', 'ongoing')->count()],
                ['name' => 'Selesai', 'value' => Internship::where('period_id', $periodId)->where('status', 'finished')->count()],
                ['name' => 'Ditolak', 'value' => Internship::where('period_id', $periodId)->where('status', 'rejected')->count()],
            ];
        } elseif ($user->isLecturerRole()) {
            $lecturerId = $user->lecturer?->id;
            $chartData = [
                ['name' => 'Menunggu', 'value' => Internship::where('period_id', $periodId)->where('supervisor_id', $lecturerId)->where('status', 'submitted')->count()],
                ['name' => 'Disetujui', 'value' => Internship::where('period_id', $periodId)->where('supervisor_id', $lecturerId)->where('status', 'approved')->count()],
                ['name' => 'Berjalan', 'value' => Internship::where('period_id', $periodId)->where('supervisor_id', $lecturerId)->where('status', 'ongoing')->count()],
                ['name' => 'Selesai', 'value' => Internship::where('period_id', $periodId)->where('supervisor_id', $lecturerId)->where('status', 'finished')->count()],
                ['name' => 'Ditolak', 'value' => Internship::where('period_id', $periodId)->where('supervisor_id', $lecturerId)->where('status', 'rejected')->count()],
            ];
        } elseif ($user->isStudent()) {
            $internshipId = $internship?->id ?? null;
            $chartData = [
                ['name' => 'Logbook Pending', 'value' => $internshipId ? \App\Models\Logbook::where('internship_id', $internshipId)->where('status', 'pending')->count() : 0],
                ['name' => 'Logbook Approved', 'value' => $internshipId ? \App\Models\Logbook::where('internship_id', $internshipId)->where('status', 'approved')->count() : 0],
                ['name' => 'Logbook Rejected', 'value' => $internshipId ? \App\Models\Logbook::where('internship_id', $internshipId)->where('status', 'rejected')->count() : 0],
            ];
        }

        return response()->json([
            'stats' => $stats,
            'chartData' => $chartData,
            'period' => $activePeriod
        ]);
    }
}
