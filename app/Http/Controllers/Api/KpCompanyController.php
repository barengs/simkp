<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKpCompanyRequest;
use App\Http\Requests\UpdateKpCompanyRequest;
use App\Http\Resources\KpCompanyResource;
use App\Services\KpCompanyService;
use Illuminate\Http\Request;

class KpCompanyController extends Controller
{
    public function __construct(
        private readonly KpCompanyService $kService
    ) {
        $this->middleware('auth:sanctum');
        // index & show boleh diakses semua role terautentikasi (mahasiswa, dosen, dst.)
        // Hanya CUD yang memerlukan permission master-data.manage (Admin).
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    public function index()
    {
        return response()->json($this->kService->getAll());
    }

    /**
     * Mahasiswa mengajukan perusahaan baru tempat KP mereka sendiri.
     * Tidak butuh master-data.manage — cukup auth:sanctum.
     */
    public function propose(StoreKpCompanyRequest $request)
    {
        $k = $this->kService->create($request->validated());
        return response()->json(new KpCompanyResource($k), 201);
    }

    public function store(StoreKpCompanyRequest $request)
    {
        $k = $this->kService->create($request->validated());
        return response()->json(new KpCompanyResource($k), 201);
    }

    public function show(int $id)
    {
        $k = $this->kService->getById($id);
        return response()->json(new KpCompanyResource($k));
    }

    public function update(UpdateKpCompanyRequest $request, int $id)
    {
        $k = $this->kService->update($id, $request->validated());
        return response()->json(new KpCompanyResource($k));
    }

    public function destroy(int $id)
    {
        $this->kService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
