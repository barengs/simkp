<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $table = 'academic_period';

    protected $fillable = ['name', 'code', 'start_date', 'end_date', 'total_members', 'is_active'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'total_members' => 'integer',
    ];
}
