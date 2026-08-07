<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpGrade extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'dosen_id', 'nilai_angka', 'nilai_huruf', 'catatan'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }
}
