<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logbook extends Model
{
    use HasFactory;

    protected $fillable = [
        'kelompok_kp_id', 'minggu_ke', 'tanggal', 'kegiatan', 'catatan', 'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'minggu_ke' => 'integer',
    ];

    public function kelompokKp()
    {
        return $this->belongsTo(KelompokKp::class);
    }
}
