<?php

namespace App\Services;

use App\Models\PengaturanAplikasi;
use Illuminate\Support\Facades\Cache;

class PengaturanService
{
    public function getPublic(): array
    {
        return Cache::remember('pengaturan.public', 600, function () {
            return PengaturanAplikasi::query()
                ->whereIn('key', ['app_name', 'logo_path', 'favicon_path'])
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    public function getAll(): \Illuminate\Support\Collection
    {
        return PengaturanAplikasi::query()->pluck('value', 'key');
    }

    public function update(array $settings): void
    {
        foreach ($settings as $key => $value) {
            PengaturanAplikasi::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        Cache::forget('pengaturan.public');
    }
}
