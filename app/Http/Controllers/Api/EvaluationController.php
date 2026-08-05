<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationRequest;
use App\Http\Resources\EvaluationResource;
use App\Models\Evaluation;
use App\Services\EvaluationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EvaluationController extends Controller
{
    protected $evaluationService;

    public function __construct(EvaluationService $evaluationService)
    {
        $this->evaluationService = $evaluationService;
    }

    /**
     * Display a listing of the evaluations.
     * Authorization handled by EvaluationPolicy::viewAny.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Evaluation::class);

        $evaluations = $this->evaluationService->getAllEvaluations();

        return EvaluationResource::collection($evaluations);
    }

    /**
     * Store a newly created evaluation.
     * Authorization handled by EvaluationPolicy::createOrUpdate.
     */
    public function store(EvaluationRequest $request): JsonResponse
    {
        $this->authorize('createOrUpdate', Evaluation::class);

        $internship = \App\Models\Internship::findOrFail($request->internship_id);
        if (!$internship->hasFinalReport()) {
            return response()->json([
                'message' => 'Penilaian tidak dapat dilakukan karena laporan belum berstatus FINAL.',
            ], 422);
        }

        $evaluation = $this->evaluationService->processEvaluation($request->validated());

        return response()->json([
            'message' => 'Penilaian KP berhasil disimpan.',
            'data' => new EvaluationResource($evaluation->load(['internship.company', 'internship.leader.user'])),
        ], 201);
    }

    /**
     * Display the specified evaluation.
     * Authorization handled by EvaluationPolicy::view.
     */
    public function show(Evaluation $evaluation): JsonResponse
    {
        $this->authorize('view', $evaluation);

        $evaluation->load(['internship.company', 'internship.leader.user']);

        return new EvaluationResource($evaluation);
    }

    /**
     * Update the specified evaluation.
     * Authorization handled by EvaluationPolicy::createOrUpdate.
     */
    public function update(EvaluationRequest $request, Evaluation $evaluation): JsonResponse
    {
        $this->authorize('createOrUpdate', $evaluation);

        $eval = $this->evaluationService->processEvaluation(array_merge(
            $request->validated(),
            ['internship_id' => $evaluation->internship_id]
        ));

        return response()->json([
            'message' => 'Penilaian KP berhasil diperbarui.',
            'data' => new EvaluationResource($eval->load(['internship.company', 'internship.leader.user'])),
        ], 200);
    }

    /**
     * Remove the specified evaluation.
     * Authorization handled by EvaluationPolicy::delete.
     */
    public function destroy(Evaluation $evaluation): JsonResponse
    {
        $this->authorize('delete', $evaluation);

        $this->evaluationService->deleteEvaluation($evaluation);

        return response()->json(['message' => 'Data penilaian berhasil dihapus.']);
    }
}
