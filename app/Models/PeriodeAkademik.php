<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeriodeAkademik extends Model
{
    use HasFactory;

    protected $fillable = ['nama_periode', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'jumlah_anggota_kp', 'is_active'];
}
