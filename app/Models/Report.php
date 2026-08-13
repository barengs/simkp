<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $table = 'report';

    protected $fillable = ['kp_group_id', 'student_id', 'status', 'rejection_note', 'title', 'description', 'file_url'];

    protected $casts = [
        'status' => 'string',
    ];

    public function kpGroup()
    {
        return $this->belongsTo(KpGroup::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
