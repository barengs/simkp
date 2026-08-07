<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudyProgram extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'study_program';

    protected $fillable = ['name', 'code', 'description', 'accreditation_level', 'dean_name', 'institution_id'];


    public function institution()
    {
        return $this->belongsTo(\App\Models\Institution::class);
    }

    public function lecturers()
    {
        return $this->hasMany(\App\Models\Lecturer::class);
    }

    public function students()
    {
        return $this->hasMany(\App\Models\Student::class);
    }
}
