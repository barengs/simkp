<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpGrade extends Model
{
    use HasFactory;

    protected $table = 'kp_grade';

    protected $fillable = [
        'kp_group_member_id',
        'evaluation_criteria_id',
        'score_field',
        'score_report',
        'score_seminar',
        'final_grade',
        'notes',
    ];

    protected $casts = [
        'score_field' => 'decimal:2',
        'score_report' => 'decimal:2',
        'score_seminar' => 'decimal:2',
    ];

    public function kpGroupMember()
    {
        return $this->belongsTo(KpGroupMember::class);
    }

    public function evaluationCriteria()
    {
        return $this->belongsTo(EvaluationCriteria::class);
    }
}
