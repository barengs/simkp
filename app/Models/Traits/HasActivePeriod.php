<?php

namespace App\Models\Traits;

use App\Models\Period;
use Illuminate\Database\Eloquent\Builder;

trait HasActivePeriod
{
    /**
     * Boot the trait to apply global scope and handle automatic assignment.
     */
    public static function bootHasActivePeriod()
    {
        // Apply Global Scope for filtering
        static::addGlobalScope('active_period', function (Builder $builder) {
            $activePeriod = Period::where('is_active', true)->first();
            if ($activePeriod) {
                $builder->where('period_id', $activePeriod->id);
            }
        });

        // Automatically set period_id on creation
        static::creating(function ($model) {
            if (!$model->period_id) {
                $activePeriod = Period::where('is_active', true)->first();
                if ($activePeriod) {
                    $model->period_id = $activePeriod->id;
                }
            }
        });
    }

    /**
     * Relationship to Period
     */
    public function period()
    {
        return $this->belongsTo(Period::class);
    }
}
