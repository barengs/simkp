<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationRequest;
use App\Http\Resources\EvaluationResource;
use App\Models\Evaluation;
use App\Services\EvaluationService;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    protected $evaluationService;

    public function __construct(EvaluationService $evaluationService)
    {
        $this->evaluationService = $evaluationService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'mahasiswa') {
            $studentId = $user->student->id ?? 0;
            $evaluations = $this->evaluationService->getEvaluationsByStudent($studentId);
            return EvaluationResource::collection($evaluations);
        } elseif ($user->role === 'dosen') {
            $internships = $this->evaluationService->getInternshipsBySupervisor($user->lecturer->id ?? 0);
            return \App\Http\Resources\InternshipResource::collection($internships);
        } else {
            $internships = $this->evaluationService->getAllInternshipsWithEvaluations();
            return \App\Http\Resources\InternshipResource::collection($internships);
        }
    }

    public function store(EvaluationRequest $request)
    {
        $internship = \App\Models\Internship::findOrFail($request->internship_id);
        if (!$internship->hasFinalReport()) {
            return response()->json(['message' => 'Penilaian tidak dapat dilakukan karena laporan belum berstatus FINAL.'], 422);
        }

        $evaluation = $this->evaluationService->processEvaluation($request->validated());

        return response()->json([
            'message' => 'Penilaian KP berhasil disimpan.',
            'data' => new EvaluationResource($evaluation->load(['internship.company', 'internship.leader.user']))
        ], 201);
    }

    public function show(Evaluation $evaluation)
    {
        $evaluation->load(['internship.company', 'internship.leader.user']);
        return new EvaluationResource($evaluation);
    }

    public function update(EvaluationRequest $request, Evaluation $evaluation)
    {
        // Actually our processEvaluation uses updateOrCreate with internship_id, 
        // but we can also handle standard PUT requests properly here.
        $eval = $this->evaluationService->processEvaluation(array_merge(
            $request->validated(), 
            ['internship_id' => $evaluation->internship_id]
        ));

        return response()->json([
            'message' => 'Penilaian KP berhasil diperbarui.',
            'data' => new EvaluationResource($eval->load(['internship.company', 'internship.leader.user']))
        ], 200);
    }

    public function destroy(Evaluation $evaluation)
    {
        $this->evaluationService->deleteEvaluation($evaluation);
        return response()->json(['message' => 'Data penilaian berhasil dihapus.']);
    }
}
