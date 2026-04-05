<?php

namespace App\Services;

use App\Models\Evaluation;
use App\Models\Internship;
use Illuminate\Support\Facades\Log;

class EvaluationService
{
    protected $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function getAllInternshipsWithEvaluations()
    {
        return Internship::with(['company', 'leader.user', 'evaluation', 'period', 'theme', 'supervisor.user', 'students.user'])
            ->whereHas('period', function ($q) {
                $q->where('is_active', true);
            })
            ->whereIn('status', ['ongoing', 'grading', 'approved', 'finished'])
            ->latest()
            ->get();
    }
    
    public function getInternshipsBySupervisor($supervisorId)
    {
        return Internship::with(['company', 'leader.user', 'evaluation', 'period', 'theme', 'students.user'])
            ->where('supervisor_id', $supervisorId)
            ->whereHas('period', function($q) {
                $q->where('is_active', true);
            })
            ->whereIn('status', ['ongoing', 'grading', 'approved', 'finished'])
            ->latest()
            ->get();
    }
    
    public function getEvaluationsByStudent($studentId)
    {
        return Evaluation::with('internship.company', 'internship.leader.user')
            ->whereHas('internship.students', function($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->orWhereHas('internship', function($q) use ($studentId) {
                $q->where('leader_id', $studentId);
            })
            ->latest()
            ->get();
    }

    public function processEvaluation(array $data)
    {
        try {
            // Auto calculating final grade
            $avg = ($data['score_field'] + $data['score_report'] + $data['score_seminar']) / 3;
            if ($avg >= 85) {
                $grade = 'A';
            } elseif ($avg >= 75) {
                $grade = 'B';
            } elseif ($avg >= 60) {
                $grade = 'C';
            } elseif ($avg >= 45) {
                $grade = 'D';
            } else {
                $grade = 'E';
            }
            $data['final_grade'] = $grade;

            $evaluation = Evaluation::updateOrCreate(
                ['internship_id' => $data['internship_id']],
                $data
            );

            // Automatically transition status to finished
            $internship = $evaluation->internship;
            if ($internship) {
                $internship->status = 'finished';
                $internship->save();
            }

            $this->activityService->log('evaluation_submitted', "Pembimbing memberikan penilaian akhir dan grade: {$evaluation->final_grade}. Status KP diubah menjadi 'finished'.");
            return $evaluation;
        } catch (\Exception $e) {
            Log::error('Failed to process evaluation: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteEvaluation(Evaluation $evaluation)
    {
        try {
            return $evaluation->delete();
        } catch (\Exception $e) {
            Log::error('Failed to delete evaluation: ' . $e->getMessage());
            throw $e;
        }
    }
}
