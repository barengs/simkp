<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingService
{
    const CACHE_KEY = 'app_settings';

    /**
     * Get all settings as an associative array with caching.
     */
    public function getAllSettings()
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return Setting::pluck('value', 'key')->toArray();
        });
    }

    /**
     * Update or create multiple settings.
     */
    public function updateSettings(array $settingsData)
    {
        try {
            foreach ($settingsData as $key => $value) {
                $setting = Setting::where('key', $key)->first();
                
                if ($setting) {
                    // If it's a file type and we are replacing it, delete old one
                    if ($setting->type === 'file' && $value instanceof \Illuminate\Http\UploadedFile) {
                        $this->deleteOldFile($setting->value);
                        $value = $this->uploadFile($value);
                    }
                    
                    $setting->update(['value' => $value]);
                } else {
                    // Create if not exists (though usually we define them first)
                    Setting::create([
                        'key' => $key,
                        'value' => $value,
                        'type' => $this->determineType($key, $value),
                        'group' => 'general'
                    ]);
                }
            }

            $this->clearCache();
            return true;
        } catch (\Exception $e) {
            Log::error('Error updating settings: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Clear the settings cache.
     */
    public function clearCache()
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Upload a branding file (logo/favicon).
     */
    private function uploadFile($file)
    {
        $path = $file->store('branding', 'public');
        return Storage::url($path);
    }

    /**
     * Delete an old file from storage.
     */
    private function deleteOldFile($fileUrl)
    {
        if (!$fileUrl) return;
        
        $path = str_replace(Storage::url(''), '', $fileUrl);
        Storage::disk('public')->delete($path);
    }

    /**
     * Helper to determine type if creating a new one.
     */
    private function determineType($key, $value)
    {
        if (str_contains($key, 'logo') || str_contains($key, 'favicon')) return 'file';
        if (is_bool($value)) return 'switch';
        return 'text';
    }
}
