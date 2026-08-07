<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'laporable_type', 'laporable_id', 'nama_file', 'path_file', 'catatan', 'status'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }

    public function laporable()
    {
        return $this->morphTo();
    }
}
