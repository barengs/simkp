<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalUjian extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'ruangan_id', 'tanggal_ujian', 'status'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }
}
