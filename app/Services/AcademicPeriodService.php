<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\DB;

class AcademicPeriodService
{
    private function baseColumns(): array
    {
        return [
            'id',
            'name',
            'start_date',
            'end_date',
            'registration_start_date',
            'registration_end_date',
            'grading_start_date',
            'grading_end_date',
            'total_members',
            'is_active',
            'created_at',
            'updated_at',
        ];
    }

    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return AcademicPeriod::select($this->baseColumns())->get();
    }

    public function getPaginated(array $params)
    {
        $query = AcademicPeriod::query()
            ->select($this->baseColumns());

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortDirection = $params['sort_direction'] ?? 'asc';
        $allowedSorts = [
            'name', 'start_date', 'end_date',
            'registration_start_date', 'registration_end_date',
            'grading_start_date', 'grading_end_date',
            'total_members', 'is_active',
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Options check
        if (isset($params['type']) && $params['type'] === 'options') {
            return $query->get();
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
    }

    public function getById(int $id): AcademicPeriod
    {
        return AcademicPeriod::findOrFail($id);
    }

    public function create(array $data): AcademicPeriod
    {
        return DB::transaction(function () use ($data) {
            // Jika is_active diset true, pastikan periode lain dinonaktifkan
            if (!empty($data['is_active'])) {
                AcademicPeriod::where('is_active', true)->update(['is_active' => false]);
            }

            return AcademicPeriod::create($data);
        });
    }

    public function update(int $id, array $data): AcademicPeriod
    {
        return DB::transaction(function () use ($id, $data) {
            $a = AcademicPeriod::findOrFail($id);

            // Jika is_active diset true, pastikan periode lain dinonaktifkan
            if (!empty($data['is_active'])) {
                AcademicPeriod::where('id', '!=', $id)->where('is_active', true)->update(['is_active' => false]);
            }

            $a->update($data);
            return $a->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            AcademicPeriod::destroy($id);
            return true;
        });
    }
}
