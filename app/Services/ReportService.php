<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Internship;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReportService
{
    protected $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    /**
     * Get reports based on user role.
     */
    public function getReports($user)
    {
        $query = Report::with(['internship.leader.user', 'internship.company', 'internship.supervisor.user']);

        if ($user->role === 'mahasiswa' && $user->student) {
            $studentId = $user->student->id;
            
            // Find active internships where the student is a member
            $internshipIds = Internship::whereHas('students', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })->pluck('id');

            $query->whereIn('internship_id', $internshipIds);
        } elseif ($user->role === 'dosen' && $user->lecturer) {
            $lecturerId = $user->lecturer->id;
            
            // Find internships supervised by this lecturer and in the active period
            $query->whereHas('internship', function ($q) use ($lecturerId) {
                $q->where('supervisor_id', $lecturerId)
                  ->whereHas('period', function($qp) {
                      $qp->where('is_active', true);
                  });
            });
        } else {
            // Admin sees all BUT only within the current active period
            $query->whereHas('internship.period', function ($q) {
                $q->where('is_active', true);
            });
        }

        return $query->latest()->get();
    }

    /**
     * Store new report.
     */
    public function createReport(array $data, $file)
    {
        try {
            if ($file) {
                $path = 'reports/' . date('Y_m_d_His') . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
                Storage::disk('public')->put($path, file_get_contents($file));
                $data['file_url'] = $path;
            }

            // Automate approval for FINAL
            if (isset($data['type']) && $data['type'] === 'final') {
                $data['status'] = 'approved';
            } else {
                $data['status'] = 'pending';
            }

            $report = Report::create($data);
            $typeText = $report->type === 'final' ? 'Laporan Akhir' : 'Draft Laporan';
            $this->activityService->log('report_submitted', "Mahasiswa mengunggah {$typeText} baru.");
            return $report;
        } catch (\Exception $e) {
            Log::error('Error creating report: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete report.
     */
    public function deleteReport(Report $report)
    {
        try {
            if ($report->file_url && Storage::disk('public')->exists($report->file_url)) {
                Storage::disk('public')->delete($report->file_url);
            }
            return $report->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting report: ' . $e->getMessage());
            throw $e;
        }
    }
}
