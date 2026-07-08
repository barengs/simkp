<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RepositoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentRepositoryController extends Controller
{
    public function __construct(
        private readonly RepositoryService $repositoryService
    ) {}

    /**
     * Get student's repository collection.
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $data = $this->repositoryService->getStudentRepository($request->user()->id);
            return response()->json([
                'status' => 'success',
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            Log::error('Fetch repository API failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data repository.',
            ], 500);
        }
    }

    /**
     * Submit/update repository details.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'abstrak_id' => 'required|string|min:50',
            'abstrak_en' => 'required|string|min:50',
            'kata_kunci' => 'required|string',
            'file_pdf_full' => 'nullable|file|mimes:pdf|max:20480',
            'file_jurnal' => 'nullable|file|mimes:pdf|max:10240',
            'file_source_code' => 'nullable|file|mimes:zip,rar,7z,tar,gz|max:51200',
            'is_public' => 'nullable',
        ]);

        try {
            $repository = $this->repositoryService->submitRepository($request->user()->id, $request->all() + [
                'file_pdf_full' => $request->file('file_pdf_full'),
                'file_jurnal' => $request->file('file_jurnal'),
                'file_source_code' => $request->file('file_source_code'),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Repository final Tugas Akhir berhasil diperbarui.',
                'data' => $repository,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
