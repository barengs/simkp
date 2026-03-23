<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    protected $fillable = [
        'internship_id',
        'score_field',
        'score_report',
        'score_presentation',
        'final_score',
        'notes'
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
