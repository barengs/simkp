<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Repository extends Model
{
    use HasFactory;

    protected $fillable = ['kelompok_kp_id', 'nama_file', 'path_file', 'tipe'];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }
}
