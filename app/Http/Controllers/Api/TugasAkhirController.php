<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterTARequest;
use App\Http\Resources\TugasAkhirResource;
use App\Services\TugasAkhirService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TugasAkhirController extends Controller
{
    public function __construct(
        private readonly TugasAkhirService $tugasAkhirService
    ) {
    }

    /**
     * Check TA eligibility (student must have finished KP).
     */
    public function eligibility(Request $request): JsonResponse
    {
        try {
            $result = $this->tugasAkhirService->checkEligibility($request->user()->id);

            return response()->json([
                'status' => 'success',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            Log::error('TA eligibility check error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengecek kelayakan pendaftaran TA.',
            ], 500);
        }
    }

    /**
     * Register a new Tugas Akhir.
     */
    public function register(RegisterTARequest $request): JsonResponse
    {
        try {
            $tugasAkhir = $this->tugasAkhirService->register(
                $request->user()->id,
                $request->validated()
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran Tugas Akhir berhasil dikirim.',
                'data' => new TugasAkhirResource($tugasAkhir),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('TA registration error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get student's active TA record.
     */
    public function myTA(Request $request): JsonResponse
    {
        try {
            $tugasAkhir = $this->tugasAkhirService->getMyTA($request->user()->id);

            return response()->json([
                'status' => 'success',
                'data' => $tugasAkhir ? new TugasAkhirResource($tugasAkhir) : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Fetch my TA error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data Tugas Akhir.',
            ], 500);
        }
    }
}
