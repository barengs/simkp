<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TugasAkhir extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'judul', 'deskripsi', 'status', 'tanggal_mulai', 'tanggal_selesai'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }

    public function bimbingan()
    {
        return $this->morphMany(Bimbingan::class, 'bimbable');
    }
}
