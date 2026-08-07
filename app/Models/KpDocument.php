<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpDocument extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'jenis_dokumen_kp_id', 'nama_file', 'path_file', 'catatan', 'status'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }

    public function jenisDokumenKp()
    {
        return $this->belongsTo(JenisDokumenKp::class);
    }
}
