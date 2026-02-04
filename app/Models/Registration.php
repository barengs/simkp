<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $fillable = [
        'student_id',
        'period_id',
        'company_id',
        'theme_id',
        'status',
        'notes',
        'documents',
        'registration_date',
    ];

    protected $casts = [
        'documents' => 'array',
        'registration_date' => 'date',
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
}
