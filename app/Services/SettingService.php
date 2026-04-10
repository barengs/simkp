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
                $finalValue = $value;
                $shouldUpload = ($value instanceof \Illuminate\Http\UploadedFile);

                if ($setting) {
                    $type = $setting->type;
                    
                    if ($shouldUpload) {
                        $this->deleteOldFile($setting->value);
                        $finalValue = $this->uploadFile($value);
                        $type = 'file'; // Auto-correct type if it was mismatched
                    }
                    
                    $setting->update([
                        'value' => $finalValue,
                        'type' => $type
                    ]);
                } else {
                    $type = $this->determineType($key, $value);
                    
                    if ($shouldUpload) {
                        $finalValue = $this->uploadFile($value);
                        $type = 'file';
                    }

                    Setting::create([
                        'key' => $key,
                        'value' => $finalValue,
                        'type' => $type,
                        'group' => ($key === 'max_group_members' || str_starts_with($key, 'app_name')) ? 'general' : 'branding'
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
        if (!$fileUrl || !is_string($fileUrl)) return;
        
        $path = parse_url($fileUrl, PHP_URL_PATH);
        if ($path) {
            // Remove /storage prefix if it exists in the path
            $storagePrefix = '/storage/';
            if (str_starts_with($path, $storagePrefix)) {
                $path = substr($path, strlen($storagePrefix));
            }
            Storage::disk('public')->delete($path);
        }
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
