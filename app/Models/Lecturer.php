<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToPeriod;

class Lecturer extends Model
{
    use BelongsToPeriod;

    protected $fillable = ['user_id', 'period_id', 'nip', 'phone'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function internship(){
        return $this->hasOne(Internship::class);
    }
}