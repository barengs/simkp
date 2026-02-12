<?php

namespace App\Services;

use App\Models\Theme;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ThemeService
{
    public function getAllThemes(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Theme::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->paginate($perPage);
    }

    public function createTheme(array $data): Theme
    {
        return Theme::create([
            'name' => $data['name'],
            'year' => $data['year'],
            'is_active' => $data['is_active'] ?? false,
        ]);
    }

    public function updateTheme(Theme $theme, array $data): Theme
    {
        $theme->update([
            'name' => $data['name'],
            'year' => $data['year'],
            'is_active' => $data['is_active'] ?? false,
        ]);

        return $theme;
    }

    public function deleteTheme(Theme $theme): void
    {
        $theme->delete();
    }
}
