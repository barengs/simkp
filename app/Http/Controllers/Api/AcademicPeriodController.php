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
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->aService->getAll());
    }

    public function store(StoreAcademicPeriodRequest $request)
    {
        $a = $this->aService->create($request->validated());
        return response()->json(new AcademicPeriodResource($a), 201);
    }

    public function show(int $id)
    {
        $a = $this->aService->getById($id);
        return response()->json(new AcademicPeriodResource($a));
    }

    public function update(UpdateAcademicPeriodRequest $request, int $id)
    {
        $a = $this->aService->update($id, $request->validated());
        return response()->json(new AcademicPeriodResource($a));
    }

    public function destroy(int $id)
    {
        $this->aService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
