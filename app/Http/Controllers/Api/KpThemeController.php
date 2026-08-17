<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKpThemeRequest;
use App\Http\Requests\UpdateKpThemeRequest;
use App\Http\Resources\KpThemeResource;
use App\Services\KpThemeService;
use Illuminate\Http\Request;

class KpThemeController extends Controller
{
    public function __construct(
        private readonly KpThemeService $kService
    ) {
        $this->middleware('auth:sanctum');
        // index & show boleh diakses semua role terautentikasi (mahasiswa, dosen, dst.)
        // Hanya CUD yang memerlukan permission master-data.manage (Admin).
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        $themes = $this->kService->getPaginated($request->all());
        return KpThemeResource::collection($themes);
    }

    public function store(StoreKpThemeRequest $request)
    {
        try {
            $k = $this->kService->create($request->validated());
            return response()->json(new KpThemeResource($k), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data tema KP.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $k = $this->kService->getById($id);
            return response()->json(new KpThemeResource($k));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data tema KP tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateKpThemeRequest $request, int $id)
    {
        try {
            $k = $this->kService->update($id, $request->validated());
            return response()->json(new KpThemeResource($k));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data tema KP.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->kService->delete($id);
            return response()->json(['message' => 'Data tema KP berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data tema KP. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
