<?php

namespace App\Helpers;

use Illuminate\Http\Request;

class FilterHelper
{
    public static function applyFilters($query, array $filters): mixed
    {
        foreach ($filters as $column => $value) {
            if ($value !== null && $value !== '') {
                $query->where($column, $value);
            }
        }

        return $query;
    }

    public static function applySearch($query, string $search, array $columns): mixed
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search, $columns) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', "%{$search}%");
            }
        });
    }

    public static function applySort($query, string $sortBy, string $sortDir = 'asc'): mixed
    {
        return $query->orderBy($sortBy, $sortDir);
    }

    public static function getFiltersFromRequest(Request $request): array
    {
        return $request->only(['search', 'sort_by', 'sort_dir', 'per_page']);
    }
}
