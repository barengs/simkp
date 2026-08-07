<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guidance extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'guidance';

    protected $fillable = ['student_id', 'lecturer_id', 'notes', 'type', 'guidance_date'];

    protected $casts = [
        'guidance_date' => 'date',
    ];
    public function student()
    {
        return $this->belongsTo(\App\Models\Student::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(\App\Models\Lecturer::class);
    }
}
