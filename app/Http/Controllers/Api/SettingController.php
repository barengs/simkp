<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    protected $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Get all settings (Publicly accessible for basic branding).
     */
    public function index()
    {
        $settings = Setting::all();
        return SettingResource::collection($settings);
    }

    /**
     * Update multiple settings (Admin only).
     */
    public function update(SettingRequest $request)
    {
        $this->settingService->updateSettings($request->all());
        
        return response()->json([
            'message' => 'Pengaturan aplikasi berhasil diperbarui.',
            'settings' => $this->settingService->getAllSettings()
        ]);
    }

    /**
     * Get settings as key-value pairs (Optimized for frontend load).
     */
    public function getKeyValue()
    {
        return response()->json([
            'data' => $this->settingService->getAllSettings()
        ]);
    }
}
