<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Schema;
use App\Models\Period;

class PeriodScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Get active period ID
        // We look for is_active = true
        $activePeriod = Period::where('is_active', true)->first();

        if ($activePeriod) {
            $builder->where($model->getTable() . '.period_id', $activePeriod->id);
        }
    }
}
