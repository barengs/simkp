<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Services\ThemeService;
use App\Http\Requests\ThemeRequest;
use App\Http\Resources\ThemeResource;

class ThemeController extends Controller
{
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    public function index()
    {
        $themes = $this->themeService->getAllThemes();
        return ThemeResource::collection($themes);
    }

    public function store(ThemeRequest $request)
    {
        $theme = $this->themeService->createTheme($request->validated());
        return new ThemeResource($theme);
    }

    public function show(Theme $theme)
    {
        return new ThemeResource($theme);
    }

    public function update(ThemeRequest $request, Theme $theme)
    {
        $updatedTheme = $this->themeService->updateTheme($theme, $request->validated());
        return new ThemeResource($updatedTheme);
    }

    public function destroy(Theme $theme)
    {
        $this->themeService->deleteTheme($theme);
        return response()->json(null, 204);
    }
}
