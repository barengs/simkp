<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\KpGroup;
use App\Models\Logbook;
use App\Policies\KpGroupPolicy;
use App\Policies\LogbookPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        KelompokKp::class => KelompokKpPolicy::class,
        Logbook::class => LogbookPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
