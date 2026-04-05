<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Group
            [
                'key' => 'app_name',
                'value' => 'SIMKP UIM',
                'type' => 'text',
                'group' => 'general',
            ],
            [
                'key' => 'max_group_members',
                'value' => '3',
                'type' => 'number',
                'group' => 'general',
            ],
            
            // Branding Group
            [
                'key' => 'app_logo',
                'value' => null,
                'type' => 'file',
                'group' => 'branding',
            ],
            [
                'key' => 'app_favicon',
                'value' => null,
                'type' => 'file',
                'group' => 'branding',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
