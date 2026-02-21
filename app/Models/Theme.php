<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasActivePeriod;

class Theme extends Model
{
    use HasActivePeriod;

    protected $fillable = [
        'period_id',
        'name',
        'year',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
