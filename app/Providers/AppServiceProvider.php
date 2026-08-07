<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\KpGroupService;
use App\Services\LogbookService;
use App\Services\SettingService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(KelompokKpService::class);
        $this->app->singleton(LogbookService::class);
        $this->app->singleton(PengaturanService::class);
    }

    public function boot(): void
    {
        //
    }
}
