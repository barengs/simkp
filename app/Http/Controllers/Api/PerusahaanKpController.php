<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePerusahaanKpRequest;
use App\Http\Requests\UpdatePerusahaanKpRequest;
use App\Http\Resources\PerusahaanKpResource;
use App\Services\PerusahaanKpService;
use Illuminate\Http\Request;

class PerusahaanKpController extends Controller
{
    public function __construct(
        private readonly PerusahaanKpService $perusahaanKpService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->perusahaanKpService->getAll());
    }

    public function store(StorePerusahaanKpRequest $request)
    {
        $perusahaan = $this->perusahaanKpService->create($request->validated());
        return response()->json(new PerusahaanKpResource($perusahaan), 201);
    }

    public function show(int $id)
    {
        $perusahaan = $this->perusahaanKpService->getById($id);
        return response()->json(new PerusahaanKpResource($perusahaan));
    }

    public function update(UpdatePerusahaanKpRequest $request, int $id)
    {
        $perusahaan = $this->perusahaanKpService->update($id, $request->validated());
        return response()->json(new PerusahaanKpResource($perusahaan));
    }

    public function destroy(int $id)
    {
        $this->perusahaanKpService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
