<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Period;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');
            $perPage = $request->query('per_page', 10);

            $periods = Period::select(['id', 'academic_year', 'semester', 'theme_name', 'start_date', 'end_date', 'is_active'])
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('academic_year', 'like', "%{$search}%")
                            ->orWhere('semester', 'like', "%{$search}%")
                            ->orWhere('theme_name', 'like', "%{$search}%");
                    });
                })
                ->latest()
                ->paginate($perPage);

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
            return DB::transaction(function () use ($request) {
                // If this new period is set as active, deactivate all others
                if ($request->is_active) {
                    Period::where('is_active', true)->update(['is_active' => false]);
                }

                $period = Period::create([
                    'academic_year' => $request->academic_year,
                    'semester' => $request->semester,
                    'theme_name' => $request->theme_name,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'is_active' => $request->is_active ?? false,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Periode berhasil ditambahkan',
                    'data' => $period
                ], 201);
            });
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
            return DB::transaction(function () use ($request, $period) {
                // If this period is being set as active, deactivate all others
                if ($request->is_active) {
                    Period::where('id', '!=', $period->id)
                        ->where('is_active', true)
                        ->update(['is_active' => false]);
                }

                $period->update([
                    'academic_year' => $request->academic_year,
                    'semester' => $request->semester,
                    'theme_name' => $request->theme_name,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'is_active' => $request->is_active ?? false,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Periode berhasil diperbarui',
                    'data' => $period
                ]);
            });
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
            $period->delete();
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
            return DB::transaction(function () use ($period) {
                // Deactivate all others efficiently
                Period::where('is_active', true)
                    ->where('id', '!=', $period->id)
                    ->update(['is_active' => false]);

                // Activate this one
                $period->update(['is_active' => true]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Periode berhasil diaktifkan',
                    'data' => $period->fresh()
                ]);
            });
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengaktifkan periode: ' . $th->getMessage()
            ], 500);
        }
    }
}

