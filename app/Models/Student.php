<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToPeriod;

class Student extends Model
{
    use BelongsToPeriod;

    protected $fillable = ['user_id', 'period_id', 'nim', 'major', 'batch_year'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
