<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BimbinganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentBimbinganController extends Controller
{
    public function __construct(
        private readonly BimbinganService $bimbinganService
    ) {}

    /**
     * Get list of student bimbingan.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->bimbinganService->getStudentBimbingan($request->user()->id);
            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            Log::error('Fetch bimbingan API failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data bimbingan.',
            ], 500);
        }
    }

    /**
     * Submit a new bimbingan entry.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'dosen_id' => 'nullable|exists:users,id',
            'tanggal_bimbingan' => 'required|date',
            'topik_bahasan' => 'required|string|min:10',
            'catatan_mahasiswa' => 'nullable|string',
            'file_draft' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        try {
            // Pass all input including files
            $bimbingan = $this->bimbinganService->createBimbingan($request->user()->id, $request->all() + ['file_draft' => $request->file('file_draft')]);
            return response()->json([
                'status' => 'success',
                'message' => 'Bimbingan berhasil dicatat.',
                'data' => $bimbingan,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete pending bimbingan entry.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->bimbinganService->deleteBimbingan($request->user()->id, $id);
            return response()->json([
                'status' => 'success',
                'message' => 'Catatan bimbingan berhasil dihapus.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
