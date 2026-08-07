<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\PengaturanAplikasi;

class SettingsController extends Controller
{
    public function public()
    {
        $settings = Cache::remember('pengaturan.public', 600, function () {
            return PengaturanAplikasi::query()
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
            PengaturanAplikasi::query()->pluck('value', 'key')
        );
    }

    public function update(Request $request)
    {
        $this->authorizeAction('pengaturan.manage');

        $data = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            PengaturanAplikasi::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
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
