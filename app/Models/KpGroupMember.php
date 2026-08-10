<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpGroupMember extends Model
{
    use HasFactory;

    protected $table = 'kp_group_member';

    protected $fillable = [
        'kp_group_id',
        'student_id',
        'role',       // 'ketua' | 'anggota'
        'join_date',
        'leave_date',
        'status',     // 'active' | 'inactive'
        'supervisor_lecturer_id',
    ];

    protected $casts = [
        'join_date'  => 'date',
        'leave_date' => 'date',
    ];

    public function kpGroup()
    {
        return $this->belongsTo(KpGroup::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Lecturer::class, 'supervisor_lecturer_id');
    }
}
