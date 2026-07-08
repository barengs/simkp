<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SidangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentSidangController extends Controller
{
    public function __construct(
        private readonly SidangService $sidangService
    ) {}

    /**
     * Get exam registration, requirements list and schedules.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->sidangService->getStudentSidangData($request->user()->id);
            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            Log::error('Fetch student sidang API failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data sidang.',
            ], 500);
        }
    }

    /**
     * Upload single requirement document.
     */
    public function uploadRequirement(Request $request): JsonResponse
    {
        $request->validate([
            'nama_dokumen' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,zip|max:5120',
        ]);

        try {
            $doc = $this->sidangService->submitRequirement(
                $request->user()->id,
                $request->input('nama_dokumen'),
                $request->file('file')
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Dokumen persyaratan berhasil diunggah.',
                'data' => $doc,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Submit exam revision.
     */
    public function submitRevision(Request $request, int $nilaiUjianId): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,zip|max:10240',
        ]);

        try {
            $nilai = $this->sidangService->submitRevision(
                $request->user()->id,
                $nilaiUjianId,
                $request->file('file')
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Dokumen revisi berhasil dikirim.',
                'data' => $nilai,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
