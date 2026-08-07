<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'student';

    protected $fillable = [
        'user_id',
        'nim',
        'name',
        'email',
        'phone_number',
        'birth_date',
        'gender',
        'nik',
        'address',
        'parent_phone_number',
        'graduation_date',
        'status',
        'study_program_id',
        'lecturer_id',
        'profile_picture_url'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'graduation_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function studyProgram()
    {
        return $this->belongsTo(\App\Models\StudyProgram::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(\App\Models\Lecturer::class);
    }
}
