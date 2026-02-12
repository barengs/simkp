<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Period;
use Illuminate\Http\Request;
use App\Services\PeriodService;

class PeriodController extends Controller
{
    protected $periodService;

    public function __construct(PeriodService $periodService)
    {
        $this->periodService = $periodService;
    }

    public function index(Request $request)
    {
        try {
            $periods = $this->periodService->getAllPeriods(
                $request->only('search'),
                $request->query('per_page', 10)
            );

            return response()->json([
                'status' => 'success',
                'data' => $periods
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data periode: ' . $th->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_year' => 'required',
            'semester' => 'required|in:ganjil,genap',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        try {
            $period = $this->periodService->createPeriod($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Periode berhasil ditambahkan',
                'data' => $period
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan periode: ' . $th->getMessage()
            ], 500);
        }
    }

    public function show(Period $period)
    {
        return response()->json([
            'status' => 'success',
            'data' => $period
        ]);
    }

    public function update(Request $request, Period $period)
    {
        $request->validate([
            'academic_year' => 'required',
            'semester' => 'required|in:ganjil,genap',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        try {
            $updatedPeriod = $this->periodService->updatePeriod($period, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Periode berhasil diperbarui',
                'data' => $updatedPeriod
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui periode: ' . $th->getMessage()
            ], 500);
        }
    }

    public function destroy(Period $period)
    {
        try {
            $this->periodService->deletePeriod($period);
            return response()->json([
                'status' => 'success',
                'message' => 'Periode berhasil dihapus'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus periode: ' . $th->getMessage()
            ], 500);
        }
    }

    public function activate(Period $period)
    {
        try {
            $activePeriod = $this->periodService->activatePeriod($period);

            return response()->json([
                'status' => 'success',
                'message' => 'Periode berhasil diaktifkan',
                'data' => $activePeriod
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengaktifkan periode: ' . $th->getMessage()
            ], 500);
        }
    }
}

