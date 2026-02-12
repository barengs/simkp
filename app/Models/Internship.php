<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    protected $fillable = [
        'leader_id',
        'period_id',
        'company_id',
        'company_name_manual',
        'theme_id',
        'supervisor_id',
        'status',
        'rejection_note',
        'proposal_url',
        'krs_url',
        'ktp_url',
        'surat_rekomendasi_url',
    ];

    public function leader()
    {
        return $this->belongsTo(Student::class, 'leader_id');
    }

    public function members()
    {
        return $this->hasMany(InternshipMember::class);
    }

    public function period()
    {
        return $this->belongsTo(Period::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class, 'supervisor_id');
    }
}
