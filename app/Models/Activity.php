<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'period_id',
        'type',
        'description',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function period()
    {
        return $this->belongsTo(Period::class);
    }

    /**
     * Automatic period assignment if not provided.
     */
    protected static function booted()
    {
        static::creating(function ($activity) {
            if (!$activity->period_id) {
                $activePeriod = Period::where('is_active', true)->first();
                $activity->period_id = $activePeriod?->id;
            }
        });
    }
}
