<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logbook extends Model
{
    protected $fillable = [
        'internship_id',
        'date',
        'activity',
        'evidence_photo',
        'status',
        'rejection_reason'
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
