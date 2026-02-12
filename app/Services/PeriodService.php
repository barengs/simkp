<?php

namespace App\Services;

use App\Models\Period;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PeriodService
{
    public function getAllPeriods(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Period::select(['id', 'academic_year', 'semester', 'theme_name', 'start_date', 'end_date', 'is_active']);

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('academic_year', 'like', "%{$search}%")
                    ->orWhere('semester', 'like', "%{$search}%")
                    ->orWhere('theme_name', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function createPeriod(array $data): Period
    {
        return DB::transaction(function () use ($data) {
            if (!empty($data['is_active'])) {
                Period::where('is_active', true)->update(['is_active' => false]);
            }

            return Period::create([
                'academic_year' => $data['academic_year'],
                'semester' => $data['semester'],
                'theme_name' => $data['theme_name'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'is_active' => $data['is_active'] ?? false,
            ]);
        });
    }

    public function updatePeriod(Period $period, array $data): Period
    {
        return DB::transaction(function () use ($period, $data) {
            if (!empty($data['is_active'])) {
                Period::where('id', '!=', $period->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $period->update([
                'academic_year' => $data['academic_year'],
                'semester' => $data['semester'],
                'theme_name' => $data['theme_name'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'is_active' => $data['is_active'] ?? false,
            ]);

            return $period;
        });
    }

    public function deletePeriod(Period $period): void
    {
        $period->delete();
    }

    public function activatePeriod(Period $period): Period
    {
        return DB::transaction(function () use ($period) {
            Period::where('is_active', true)
                ->where('id', '!=', $period->id)
                ->update(['is_active' => false]);

            $period->update(['is_active' => true]);

            return $period->fresh();
        });
    }
}
