<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bimbingan extends Model
{
    use HasFactory;

    protected $fillable = ['dosen_id', 'bimbable_type', 'bimbable_id', 'catatan', 'status'];

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }

    public function bimbable()
    {
        return $this->morphTo();
    }
}
