<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting as AppSetting;

class SettingController extends Controller
{
    public function public()
    {
        $settings = Cache::remember('pengaturan.public', 600, function () {
            return AppSetting::query()
                ->whereIn('key', ['app_name', 'logo_path', 'favicon_path'])
                ->pluck('value', 'key');
        });

        return response()->json([
            'app_name' => $settings['app_name'] ?? 'SIM-KPTA',
            'logo_path' => $settings['logo_path'] ?? null,
            'favicon_path' => $settings['favicon_path'] ?? null,
        ]);
    }

    public function index()
    {
        $this->authorizeAction('pengaturan.manage');

        return response()->json(
            AppSetting::query()->pluck('value', 'key')
        );
    }

    public function update(Request $request)
    {
        $this->authorizeAction('pengaturan.manage');

        $data = $request->validate([
            'app_name'     => ['nullable', 'string', 'max:255'],
            'logo_path'    => ['nullable', 'image', 'max:2048'],
            'favicon_path' => ['nullable', 'image', 'max:1024'],
        ]);

        if ($request->has('app_name')) {
            AppSetting::updateOrCreate(['key' => 'app_name'], ['value' => $data['app_name']]);
        }

        if ($request->hasFile('logo_path')) {
            $path = $request->file('logo_path')->store('settings', 'public');
            AppSetting::updateOrCreate(['key' => 'logo_path'], ['value' => '/storage/' . $path]);
        }

        if ($request->hasFile('favicon_path')) {
            $path = $request->file('favicon_path')->store('settings', 'public');
            AppSetting::updateOrCreate(['key' => 'favicon_path'], ['value' => '/storage/' . $path]);
        }

        Cache::forget('pengaturan.public');

        return response()->json(['message' => 'Pengaturan disimpan']);
    }

    private function authorizeAction(string $permission): void
    {
        abort_unless(
            request()->user()?->can($permission),
            403,
            'Tidak memiliki permission: ' . $permission
        );
    }
}
