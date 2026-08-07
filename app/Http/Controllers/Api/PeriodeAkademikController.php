<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePeriodeAkademikRequest;
use App\Http\Requests\UpdatePeriodeAkademikRequest;
use App\Http\Resources\PeriodeAkademikResource;
use App\Services\PeriodeAkademikService;
use Illuminate\Http\Request;

class PeriodeAkademikController extends Controller
{
    public function __construct(
        private readonly PeriodeAkademikService $periodeAkademikService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->periodeAkademikService->getAll());
    }

    public function store(StorePeriodeAkademikRequest $request)
    {
        $periode = $this->periodeAkademikService->create($request->validated());
        return response()->json(new PeriodeAkademikResource($periode), 201);
    }

    public function show(int $id)
    {
        $periode = $this->periodeAkademikService->getById($id);
        return response()->json(new PeriodeAkademikResource($periode));
    }

    public function update(UpdatePeriodeAkademikRequest $request, int $id)
    {
        $periode = $this->periodeAkademikService->update($id, $request->validated());
        return response()->json(new PeriodeAkademikResource($periode));
    }

    public function destroy(int $id)
    {
        $this->periodeAkademikService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
