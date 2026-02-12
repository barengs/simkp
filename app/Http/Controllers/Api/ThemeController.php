<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Theme;
use App\Services\ThemeService;

class ThemeController extends Controller
{
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    public function index(Request $request)
    {
        $themes = $this->themeService->getAllThemes(
            $request->only('search'),
            $request->get('per_page', 10)
        );

        return response()->json([
            'status' => 'success',
            'data' => $themes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|string',
            'is_active' => 'boolean',
        ]);

        try {
            $theme = $this->themeService->createTheme($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Tema berhasil ditambahkan',
                'data' => $theme
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan tema',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function show(Theme $theme)
    {
        return response()->json([
            'status' => 'success',
            'data' => $theme
        ]);
    }

    public function update(Request $request, Theme $theme)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|string',
            'is_active' => 'boolean',
        ]);

        try {
            $updatedTheme = $this->themeService->updateTheme($theme, $validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Tema berhasil diperbarui',
                'data' => $updatedTheme
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui tema',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function destroy(Theme $theme)
    {
        try {
            $this->themeService->deleteTheme($theme);
            return response()->json([
                'status' => 'success',
                'message' => 'Tema berhasil dihapus'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus tema',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}
