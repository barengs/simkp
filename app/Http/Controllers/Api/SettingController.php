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
        // Merge text inputs and file uploads explicitly.
        // $request->all() in some contexts does NOT include UploadedFile objects,
        // so we must merge allFiles() to ensure file inputs reach SettingService.
        $settingsData = array_merge($request->all(), $request->allFiles());
        
        $this->settingService->updateSettings($settingsData);
        
        // Fetch fresh key-value settings to update publicSettings in Redux
        $updatedSettings = $this->settingService->getAllSettings();

        return response()->json([
            'message' => 'Pengaturan aplikasi berhasil diperbarui.',
            'settings' => $updatedSettings
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
