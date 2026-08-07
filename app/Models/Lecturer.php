<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lecturer extends Model
{
    use HasFactory;

    protected $table = 'lecturer';

    protected $fillable = [
        'user_id',
        'nip',
        'name',
        'email',
        'phone_number',
        'birth_date',
        'gender',
        'nidn',
        'address',
        'office_address',
        'position',
        'expertise',
        'profile_picture_url',
        'study_program_id'
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function studyProgram()
    {
        return $this->belongsTo(\App\Models\StudyProgram::class);
    }
}
