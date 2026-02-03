<?php

namespace App\Traits;

use App\Models\Period;
use App\Models\Scopes\PeriodScope;
use Illuminate\Database\Eloquent\Model;

trait BelongsToPeriod
{
    protected static function bootBelongsToPeriod()
    {
        static::addGlobalScope(new PeriodScope);

        static::creating(function (Model $model) {
            if (!$model->period_id) {
                $activePeriod = Period::where('is_active', true)->first();
                if ($activePeriod) {
                    $model->period_id = $activePeriod->id;
                }
            }
        });
    }

    public function period()
    {
        return $this->belongsTo(Period::class);
    }
}
