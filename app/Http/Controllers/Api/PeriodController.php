<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PeriodService;
use App\Http\Requests\PeriodRequest;
use App\Http\Resources\PeriodResource;
use App\Models\Period;

class PeriodController extends Controller
{
    protected $periodService;

    public function __construct(PeriodService $periodService)
    {
        $this->periodService = $periodService;
    }

    public function index()
    {
        $periods = $this->periodService->getAllPeriods();
        return PeriodResource::collection($periods);
    }

    public function store(PeriodRequest $request)
    {
        $period = $this->periodService->createPeriod($request->validated());
        return new PeriodResource($period);
    }

    public function show(Period $period)
    {
        return new PeriodResource($period);
    }

    public function update(PeriodRequest $request, Period $period)
    {
        $updatedPeriod = $this->periodService->updatePeriod($period, $request->validated());
        return new PeriodResource($updatedPeriod);
    }

    public function destroy(Period $period)
    {
        try {
            $this->periodService->deletePeriod($period);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function toggleActive(Period $period)
    {
        try {
            $this->periodService->toggleActive($period);
            return response()->json(['message' => 'Periode berhasil diaktifkan.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
