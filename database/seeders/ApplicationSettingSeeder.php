<?php

namespace Database\Seeders;

use App\Models\ApplicationSetting;
use Illuminate\Database\Seeder;

class ApplicationSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'kp_jumlah_anggota_default', 'value' => '3', 'type' => 'integer'],
            ['key' => 'kp_batas_hari_mulai', 'value' => '7', 'type' => 'integer'],
            ['key' => 'kp_batas_hari_akhir', 'value' => '30', 'type' => 'integer'],
            ['key' => 'logbook_reminder_hari', 'value' => '7', 'type' => 'integer'],
            ['key' => 'default_theme', 'value' => 'light', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            ApplicationSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }

        $this->command->info('Application settings created successfully!');
    }
}
