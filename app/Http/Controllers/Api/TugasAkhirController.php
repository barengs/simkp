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

    // =========================================================
    // Koordinator / Admin Methods
    // =========================================================

    /**
     * [Koordinator/Admin] List all TA submissions, optionally filtered by ?status=pengajuan|bimbingan|dll
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $status = $request->query('status');
            $submissions = $this->tugasAkhirService->getAllSubmissions($status);

            return response()->json([
                'status' => 'success',
                'data'   => $submissions,
            ]);
        } catch (\Throwable $e) {
            Log::error('Fetch all TA submissions error', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengambil data pengajuan TA.',
            ], 500);
        }
    }

    /**
     * [Koordinator/Admin] Approve a TA submission.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'judul_disetujui' => 'nullable|string|max:500',
            ]);

            $ta = $this->tugasAkhirService->approveTA($id, $data);

            return response()->json([
                'status'  => 'success',
                'message' => 'Pengajuan TA berhasil disetujui.',
                'data'    => $ta,
            ]);
        } catch (\Throwable $e) {
            Log::error('TA approve error', ['ta_id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * [Koordinator/Admin] Reject a TA submission.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'rejection_note' => 'required|string|max:1000',
            ]);

            $ta = $this->tugasAkhirService->rejectTA($id, $data['rejection_note']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Pengajuan TA berhasil ditolak.',
                'data'    => $ta,
            ]);
        } catch (\Throwable $e) {
            Log::error('TA reject error', ['ta_id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * [Koordinator/Admin] Assign pembimbing 1 & 2.
     */
    public function assignPembimbing(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'pembimbing_1_id' => 'required|exists:users,id',
                'pembimbing_2_id' => 'nullable|exists:users,id',
            ]);

            $ta = $this->tugasAkhirService->assignPembimbing($id, $data);

            return response()->json([
                'status'  => 'success',
                'message' => 'Dosen pembimbing berhasil ditetapkan.',
                'data'    => $ta,
            ]);
        } catch (\Throwable $e) {
            Log::error('TA assign pembimbing error', ['ta_id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
