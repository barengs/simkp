<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpGroup extends Model
{
    use HasFactory;

    protected $table = 'kp_group';

    protected $fillable = [
        'name',
        'code',
        'kp_company_id',
        'kp_theme_id',
        'academic_period_id',
        'status',
        'rejection_note',
        'description',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // ── Relasi ────────────────────────────────────────────────────────────────

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function kpTheme()
    {
        return $this->belongsTo(KpTheme::class);
    }

    public function kpCompany()
    {
        return $this->belongsTo(KpCompany::class);
    }

    /** Anggota kelompok (pivot kp_group_member) */
    public function members()
    {
        return $this->hasMany(KpGroupMember::class);
    }

    public function logbooks()
    {
        return $this->hasMany(Logbook::class);
    }

    /** Dokumen yang diupload untuk kelompok ini */
    public function kpDocuments()
    {
        return $this->hasMany(KpDocument::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
