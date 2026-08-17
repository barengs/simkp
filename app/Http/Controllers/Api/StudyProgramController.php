<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudyProgramRequest;
use App\Http\Requests\UpdateStudyProgramRequest;
use App\Http\Resources\StudyProgramResource;
use App\Services\StudyProgramService;
use Illuminate\Http\Request;

class StudyProgramController extends Controller
{
    public function __construct(
        private readonly StudyProgramService $sService
    ) {
        $this->middleware('auth:sanctum');
        // index & show boleh diakses semua role terautentikasi (mahasiswa, dosen, dst.)
        // Hanya CUD yang memerlukan permission master-data.manage (Admin).
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    public function index()
    {
        return response()->json($this->sService->getAll());
    }

    public function store(StoreStudyProgramRequest $request)
    {
        try {
            $s = $this->sService->create($request->validated());
            return response()->json(new StudyProgramResource($s), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data program studi.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $s = $this->sService->getById($id);
            return response()->json(new StudyProgramResource($s));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data program studi tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateStudyProgramRequest $request, int $id)
    {
        try {
            $s = $this->sService->update($id, $request->validated());
            return response()->json(new StudyProgramResource($s));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data program studi.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->sService->delete($id);
            return response()->json(['message' => 'Data program studi berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data program studi. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
