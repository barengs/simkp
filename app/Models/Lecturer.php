<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Lecturer extends Model
{


    protected $fillable = [
        'user_id',

        'nip',
        'phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class, 'supervisor_id');
    }
}
