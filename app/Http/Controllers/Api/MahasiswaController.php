<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMahasiswaRequest;
use App\Http\Requests\UpdateMahasiswaRequest;
use App\Http\Resources\MahasiswaResource;
use App\Services\MahasiswaService;
use Illuminate\Http\Request;

class MahasiswaController extends Controller
{
    public function __construct(
        private readonly MahasiswaService $mahasiswaService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->mahasiswaService->getAll());
    }

    public function store(StoreMahasiswaRequest $request)
    {
        $mahasiswa = $this->mahasiswaService->create($request->validated());
        return response()->json(new MahasiswaResource($mahasiswa), 201);
    }

    public function show(int $id)
    {
        $mahasiswa = $this->mahasiswaService->getById($id);
        return response()->json(new MahasiswaResource($mahasiswa));
    }

    public function update(UpdateMahasiswaRequest $request, int $id)
    {
        $mahasiswa = $this->mahasiswaService->update($id, $request->validated());
        return response()->json(new MahasiswaResource($mahasiswa));
    }

    public function destroy(int $id)
    {
        $this->mahasiswaService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
