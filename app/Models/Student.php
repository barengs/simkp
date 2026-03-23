<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToPeriod;

class Student extends Model
{
    use BelongsToPeriod;

    protected $fillable = ['user_id', 'period_id', 'nim', 'major', 'batch_year', 'phone'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function internshipMembers()
    {
        return $this->hasMany(InternshipMember::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class, 'leader_id');
    }
}
