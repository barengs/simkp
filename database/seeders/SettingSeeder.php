<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        // General application settings
        $settings = [
            ['key' => 'app_name', 'value' => 'SIM-KPTA', 'type' => 'string'],
            ['key' => 'app_title', 'value' => 'Sistem Informasi KP Mahasiswa', 'type' => 'string'],
            ['key' => 'app_logo_url', 'value' => null, 'type' => 'string'],
            ['key' => 'favicon_url', 'value' => null, 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }

        $this->command->info('General settings created successfully!');
    }
}
