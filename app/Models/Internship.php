<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    protected $fillable = [
        'student_id',
        'period_id',
        'company_id',
        'theme_id',
        'supervisor_id',
        'status',
        'proposal_url',
        'krs_url',
        'ktp_url',
        'surat_rekomendasi_url',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
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
