<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuidanceRequest;
use App\Http\Requests\UpdateGuidanceRequest;
use App\Http\Resources\GuidanceResource;
use App\Services\GuidanceService;
use Illuminate\Http\Request;

class GuidanceController extends Controller
{
    public function __construct(
        private readonly GuidanceService $gService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->gService->getAll());
    }

    public function store(StoreGuidanceRequest $request)
    {
        $g = $this->gService->create($request->validated());
        return response()->json(new GuidanceResource($g), 201);
    }

    public function show(int $id)
    {
        $g = $this->gService->getById($id);
        return response()->json(new GuidanceResource($g));
    }

    public function update(UpdateGuidanceRequest $request, int $id)
    {
        $g = $this->gService->update($id, $request->validated());
        return response()->json(new GuidanceResource($g));
    }

    public function destroy(int $id)
    {
        $this->gService->delete($id);
        return response()->json(['message' => 'Data bimbingan berhasil dihapus']);
    }
}
