<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnggotaKelompokKp extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'mahasiswa_id', 'urutan'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
