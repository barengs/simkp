<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Period extends Model
{
    protected $fillable = [
        'academic_year',
        'semester',
        'theme_name',
        'start_date',
        'end_date',
        'is_active',
    ];
}
