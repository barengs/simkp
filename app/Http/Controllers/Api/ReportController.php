<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    protected $gradingService;

    public function __construct(GradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240', // Max 10MB
            'repository_url' => 'nullable|url'
        ]);

        $user = $request->user();
        if (!$user->student) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $studentId = $user->student->id;
        $internship = \App\Models\Internship::where(function ($query) use ($studentId) {
            $query->where('leader_id', $studentId)
                ->orWhereHas('members', function ($q) use ($studentId) {
                    $q->where('student_id', $studentId);
                });
        })
            ->whereIn('status', ['ongoing', 'grading', 'finished'])
            ->latest()
            ->first();

        if (!$internship) {
            return response()->json(['message' => 'Tidak ada KP aktif'], 404);
        }

        try {
            $path = $request->file('file')->store('reports', 'public');
            $fileUrl = Storage::url($path);

            $report = $this->gradingService->submitReport(
                $internship,
                $fileUrl,
                $request->repository_url
            );

            return response()->json(['message' => 'Laporan berhasil diunggah', 'data' => $report]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengunggah laporan: ' . $e->getMessage()], 500);
        }
    }
}
