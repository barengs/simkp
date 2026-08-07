<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\KelompokKpService;
use App\Services\LogbookService;
use App\Services\PengaturanService;

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
