<?php

namespace App\Providers;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Evaluation;
use App\Policies\InternshipPolicy;
use App\Policies\LogbookPolicy;
use App\Policies\ReportPolicy;
use App\Policies\EvaluationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Internship::class => InternshipPolicy::class,
        Logbook::class => LogbookPolicy::class,
        Report::class => ReportPolicy::class,
        Evaluation::class => EvaluationPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Admin bypass: admin selalu diizinkan untuk semua ability
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('admin')) {
                return true;
            }
        });
    }
}
