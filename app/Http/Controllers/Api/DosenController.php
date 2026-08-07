<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDosenRequest;
use App\Http\Requests\UpdateDosenRequest;
use App\Http\Resources\DosenResource;
use App\Services\DosenService;
use Illuminate\Http\Request;

class DosenController extends Controller
{
    public function __construct(
        private readonly DosenService $dosenService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->dosenService->getAll());
    }

    public function store(StoreDosenRequest $request)
    {
        $dosen = $this->dosenService->create($request->validated());
        return response()->json(new DosenResource($dosen), 201);
    }

    public function show(int $id)
    {
        $dosen = $this->dosenService->getById($id);
        return response()->json(new DosenResource($dosen));
    }

    public function update(UpdateDosenRequest $request, int $id)
    {
        $dosen = $this->dosenService->update($id, $request->validated());
        return response()->json(new DosenResource($dosen));
    }

    public function destroy(int $id)
    {
        $this->dosenService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
