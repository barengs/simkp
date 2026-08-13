<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\KpGroup;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\KpGrade;
use App\Policies\KpGroupPolicy;
use App\Policies\LogbookPolicy;
use App\Policies\ReportPolicy;
use App\Policies\KpGradePolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        KpGroup::class => KpGroupPolicy::class,
        Logbook::class => LogbookPolicy::class,
        Report::class => ReportPolicy::class,
        KpGrade::class => KpGradePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
