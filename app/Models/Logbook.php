<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Logbook extends Model
{
    use HasFactory;

    protected $table = 'logbook';

    protected $fillable = [
        'kp_group_id',
        'student_id',
        'date',
        'activity',
        'evidence_photo',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function kpGroup(): BelongsTo
    {
        return $this->belongsTo(KpGroup::class, 'kp_group_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
