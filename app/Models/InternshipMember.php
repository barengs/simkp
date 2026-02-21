<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InternshipMember extends Model
{
    protected $fillable = [
        'internship_id',
        'student_id',
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
