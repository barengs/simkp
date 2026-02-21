<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasActivePeriod;

class Company extends Model
{
    use HasActivePeriod;

    protected $fillable = [
        'period_id',
        'name',
        'address',
        'contact_person',
        'phone',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];
}
