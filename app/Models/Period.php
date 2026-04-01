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

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = ['status'];

    public function getStatusAttribute()
    {
        $now = now();
        if ($this->end_date && $now->greaterThan($this->end_date)) {
            return 'finished';
        }
        if ($this->is_active) {
            return 'active';
        }
        return 'inactive';
    }
}
