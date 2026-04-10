<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'internship_id',
        'file_url',
        'title',
        'description',
        'status', // 'pending', 'approved', 'rejected'
        'feedback', // Alasan penolakan
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
