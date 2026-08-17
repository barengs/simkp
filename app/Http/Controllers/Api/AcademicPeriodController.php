<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAcademicPeriodRequest;
use App\Http\Requests\UpdateAcademicPeriodRequest;
use App\Http\Resources\AcademicPeriodResource;
use App\Services\AcademicPeriodService;
use Illuminate\Http\Request;

class AcademicPeriodController extends Controller
{
    public function __construct(
        private readonly AcademicPeriodService $aService
    ) {
        $this->middleware('auth:sanctum');
        // index & show boleh diakses semua role terautentikasi (mahasiswa, dosen, dst.)
        // karena data ini dibutuhkan sebagai referensi saat mengisi form KP/TA.
        // Hanya CUD yang memerlukan permission master-data.manage (Admin).
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        $periods = $this->aService->getPaginated($request->all());
        return AcademicPeriodResource::collection($periods);
    }

    public function store(StoreAcademicPeriodRequest $request)
    {
        try {
            $a = $this->aService->create($request->validated());
            return response()->json(new AcademicPeriodResource($a), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data periode akademik.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $a = $this->aService->getById($id);
            return response()->json(new AcademicPeriodResource($a));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data periode akademik tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateAcademicPeriodRequest $request, int $id)
    {
        try {
            $a = $this->aService->update($id, $request->validated());
            return response()->json(new AcademicPeriodResource($a));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data periode akademik.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->aService->delete($id);
            return response()->json(['message' => 'Data periode akademik berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data periode akademik. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
