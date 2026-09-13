<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpDocument extends Model
{
    use HasFactory;

    protected $table = 'kp_document';

    protected $fillable = [
        'title',
        'document_type_id',
        'kp_group_id',
        'student_id',
        'file_url',
        'submitted_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    // ── Relasi ────────────────────────────────────────────────────────────────

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function kpGroup()
    {
        return $this->belongsTo(KpGroup::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
