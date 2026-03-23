<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradingService;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    protected $gradingService;

    public function __construct(GradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    public function store(Request $request)
    {
        $request->validate([
            'internship_id' => 'required|exists:internships,id',
            'score_field' => 'required|numeric|min:0|max:100',
            'score_report' => 'required|numeric|min:0|max:100',
            'score_presentation' => 'required|numeric|min:0|max:100',
            'final_score' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string'
        ]);

        $user = $request->user();
        // Check if lecturer is supervisor of this internship
        // Logic handled or can be added here. Assume valid for now or add check.
        // For strictness:
        // $internship = Internship::find($request->internship_id);
        // if ($internship->supervisor_id !== $user->lecturer->id) abort(403);

        try {
            $internship = \App\Models\Internship::findOrFail($request->internship_id);

            // Validate ownership
            if (!$user->lecturer || $internship->supervisor_id !== $user->lecturer->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $evaluation = $this->gradingService->submitEvaluation($internship, $request->all());

            return response()->json(['message' => 'Nilai berhasil disimpan', 'data' => $evaluation]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menyimpan nilai: ' . $e->getMessage()], 500);
        }
    }

    public function bimbingan(Request $request)
    {
        $user = $request->user();
        if (!$user->lecturer) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $students = $this->gradingService->getBimbinganStudents($user->lecturer->id);
        return response()->json($students);
    }
}
