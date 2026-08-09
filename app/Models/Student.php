<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $table = 'student';

    protected $fillable = [
        'user_id',
        'nim',
        'study_program_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ── Relasi ────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function studyProgram(): BelongsTo
    {
        return $this->belongsTo(StudyProgram::class, 'study_program_id');
    }

    /** Semua keanggotaan kelompok KP mahasiswa ini */
    public function kpGroupMembers(): HasMany
    {
        return $this->hasMany(KpGroupMember::class, 'student_id');
    }

    /** Kelompok KP aktif mahasiswa ini (via pivot) */
    public function kpGroups()
    {
        return $this->belongsToMany(KpGroup::class, 'kp_group_member', 'student_id', 'kp_group_id')
            ->withPivot(['role', 'status', 'join_date'])
            ->withTimestamps();
    }
}
