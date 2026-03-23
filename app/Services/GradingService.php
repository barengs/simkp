<?php

namespace App\Services;

use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\Report;
use Illuminate\Validation\ValidationException;

class GradingService
{
    public function submitReport(Internship $internship, string $fileUrl, ?string $repoUrl): Report
    {
        $report = Report::updateOrCreate(
            ['internship_id' => $internship->id],
            [
                'file_url' => $fileUrl,
                'repository_url' => $repoUrl
            ]
        );

        // Update internship status to grading
        $internship->status = 'grading';
        $internship->save();

        return $report;
    }

    public function submitEvaluation(Internship $internship, array $data): Evaluation
    {
        $evaluation = Evaluation::updateOrCreate(
            ['internship_id' => $internship->id],
            [
                'score_field' => $data['score_field'],
                'score_report' => $data['score_report'],
                'score_presentation' => $data['score_presentation'],
                'final_score' => $data['final_score'],
                'notes' => $data['notes'] ?? null
            ]
        );

        // Update internship status to finished
        $internship->status = 'finished';
        $internship->save();

        return $evaluation;
    }

    public function getBimbinganStudents($lecturerId)
    {
        return Internship::with(['leader.user', 'report', 'evaluation'])
            ->where('supervisor_id', $lecturerId)
            ->whereIn('status', ['ongoing', 'grading', 'finished'])
            ->latest()
            ->get();
    }
}
