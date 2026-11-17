<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $table = 'academic_period';

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'registration_start_date',
        'registration_end_date',
        'grading_start_date',
        'grading_end_date',
        'total_members',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'registration_start_date' => 'date',
        'registration_end_date' => 'date',
        'grading_start_date' => 'date',
        'grading_end_date' => 'date',
        'is_active' => 'boolean',
        'total_members' => 'integer',
    ];

    /**
     * Cek apakah masa pendaftaran sedang dibuka saat ini
     */
    public function isRegistrationOpen(): bool
    {
        if (!$this->is_active || !$this->registration_start_date || !$this->registration_end_date) {
            return false;
        }

        $now = now()->toDateString();
        return $now >= $this->registration_start_date->toDateString()
            && $now <= $this->registration_end_date->toDateString();
    }

    /**
     * Cek apakah masa input nilai sedang dibuka saat ini
     */
    public function isGradingOpen(): bool
    {
        if (!$this->is_active || !$this->grading_start_date || !$this->grading_end_date) {
            return false;
        }

        $now = now()->toDateString();
        return $now >= $this->grading_start_date->toDateString()
            && $now <= $this->grading_end_date->toDateString();
    }
}
