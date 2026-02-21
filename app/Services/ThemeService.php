<?php

namespace App\Services;

use App\Models\Theme;
use Illuminate\Support\Facades\Log;

class ThemeService
{
    public function getAllThemes()
    {
        return Theme::latest()->get();
    }

    public function createTheme(array $data)
    {
        try {
            return Theme::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to create theme: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateTheme(Theme $theme, array $data)
    {
        try {
            $theme->update($data);
            return $theme;
        } catch (\Exception $e) {
            Log::error('Failed to update theme: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteTheme(Theme $theme)
    {
        try {
            $theme->delete();
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to delete theme: ' . $e->getMessage());
            throw $e;
        }
    }
}
