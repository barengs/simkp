<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'app_name', 'value' => 'SIMKP - UIM', 'type' => 'text', 'group' => 'general'],
            ['key' => 'app_tagline', 'value' => 'Sistem Informasi Manajemen Kerja Praktik', 'type' => 'text', 'group' => 'general'],
            ['key' => 'footer_text', 'value' => '© 2026 Universitas Islam Madura - SIMKP Team', 'type' => 'text', 'group' => 'general'],
            ['key' => 'app_logo', 'value' => null, 'type' => 'file', 'group' => 'branding'],
            ['key' => 'app_favicon', 'value' => null, 'type' => 'file', 'group' => 'branding'],
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
