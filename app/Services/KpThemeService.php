<?php

namespace App\Services;

use App\Models\KpTheme;
use Illuminate\Support\Facades\DB;

class KpThemeService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return KpTheme::select([
            'id',
            'title',
            'description',
            'is_active',
        ])->get();
    }

    public function getPaginated(array $params)
    {
        $query = KpTheme::query()
            ->select([
                'id',
                'title',
                'description',
                'is_active',
            ]);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'title';
        $sortDirection = $params['sort_direction'] ?? 'asc';
        $allowedSorts = ['title', 'description', 'is_active'];

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

    public function getById(int $id): KpTheme
    {
        return KpTheme::findOrFail($id);
    }

    public function create(array $data): KpTheme
    {
        return DB::transaction(function () use ($data) {
            return KpTheme::create($data);
        });
    }

    public function update(int $id, array $data): KpTheme
    {
        return DB::transaction(function () use ($id, $data) {
            $k = KpTheme::findOrFail($id);
            $k->update($data);
            return $k->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            KpTheme::destroy($id);
            return true;
        });
    }
}
