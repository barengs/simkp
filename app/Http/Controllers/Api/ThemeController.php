<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Theme::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $themes = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $themes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'year'      => 'required|string',
            'is_active' => 'boolean',
        ]);

        try {
            $theme = \App\Models\Theme::create($validated);

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

    public function show(\App\Models\Theme $theme)
    {
        return response()->json([
            'status' => 'success',
            'data' => $theme
        ]);
    }

    public function update(Request $request, \App\Models\Theme $theme)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'year'      => 'required|string',
            'is_active' => 'boolean',
        ]);

        try {
            $theme->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Tema berhasil diperbarui',
                'data' => $theme
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui tema',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function destroy(\App\Models\Theme $theme)
    {
        try {
            $theme->delete();
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
