<?php

namespace Database\Seeders;

use App\Models\KpTheme;
use Illuminate\Database\Seeder;

class KpThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'title' => 'Pengembangan Aplikasi Web',
                'description' => 'Kerja praktik berfokus pada perancangan dan implementasi aplikasi berbasis web.',
                'is_active' => true,
            ],
            [
                'title' => 'Sistem Informasi Perusahaan',
                'description' => 'Analisis dan pengembangan sistem informasi untuk mendukung operasional mitra.',
                'is_active' => true,
            ],
            [
                'title' => 'Mobile Application Development',
                'description' => 'Pengembangan aplikasi mobile (Android/iOS) sesuai kebutuhan mitra industri.',
                'is_active' => true,
            ],
            [
                'title' => 'Data Analytics & Business Intelligence',
                'description' => 'Pengolahan data, dashboard, dan insight untuk pengambilan keputusan.',
                'is_active' => true,
            ],
            [
                'title' => 'DevOps & Cloud Infrastructure',
                'description' => 'Deploy, CI/CD, monitoring, dan pengelolaan infrastruktur cloud.',
                'is_active' => true,
            ],
            [
                'title' => 'Keamanan Siber',
                'description' => 'Audit keamanan, hardening, dan implementasi praktik keamanan informasi.',
                'is_active' => false,
            ],
        ];

        foreach ($themes as $theme) {
            KpTheme::create($theme);
        }

        $this->command->info(count($themes) . ' KP themes created successfully!');
    }
}
