<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Institution extends Model
{
    use HasFactory;

    protected $table = 'institution';

    protected $fillable = [
        'name',
        'abbreviation',
        'accreditation_level',
        'address',
        'phone_number',
        'email',
        'website',
    ];

    public function studyPrograms()
    {
        return $this->hasMany(StudyProgram::class);
    }
}
