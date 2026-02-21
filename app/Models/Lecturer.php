<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasActivePeriod;

class Lecturer extends Model
{
    use HasActivePeriod;

    protected $fillable = [
        'user_id',
        'period_id',
        'nip',
        'phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
