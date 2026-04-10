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
        'company_address_manual',
        'company_contact_manual',
        'company_phone_manual',
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

    public function supervisor()
    {
        return $this->belongsTo(Lecturer::class, 'supervisor_id');
    }

    public function members()
    {
        return $this->hasMany(InternshipMember::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'internship_members');
    }

    public function logbooks()
    {
        return $this->hasMany(Logbook::class);
    }

    public function evaluation()
    {
        return $this->hasOne(Evaluation::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function hasFinalReport()
    {
        return $this->reports()->where('status', 'approved')->exists();
    }
}
