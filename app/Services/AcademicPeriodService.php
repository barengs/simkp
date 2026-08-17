<?php

namespace App\Services;

use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\DB;

class AcademicPeriodService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return AcademicPeriod::select([
            'id',
            'name',
            'start_date',
            'end_date',
            'total_members',
            'is_active',
        ])->get();
    }

    public function getPaginated(array $params)
    {
        $query = AcademicPeriod::query()
            ->select([
                'id',
                'name',
                'start_date',
                'end_date',
                'total_members',
                'is_active',
            ]);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortDirection = $params['sort_direction'] ?? 'asc';
        $allowedSorts = ['name', 'start_date', 'end_date', 'total_members', 'is_active'];

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
            return AcademicPeriod::create($data);
        });
    }

    public function update(int $id, array $data): AcademicPeriod
    {
        return DB::transaction(function () use ($id, $data) {
            $a = AcademicPeriod::findOrFail($id);
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
