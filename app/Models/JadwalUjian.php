<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JadwalUjian extends Model
{
    protected $table = 'jadwal_ujian';

    protected $fillable = [
        'tugas_akhir_id',
        'ruangan_id',
        'jenis_ujian',
        'tanggal_ujian',
        'waktu_mulai',
        'waktu_selesai',
        'link_online',
        'status_ujian',
    ];

    /**
     * Get the Tugas Akhir record.
     */
    public function tugasAkhir(): BelongsTo
    {
        return $this->belongsTo(TugasAkhir::class);
    }

    /**
     * Get grades/evaluations for this schedule.
     */
    public function nilaiUjian(): HasMany
    {
        return $this->hasMany(NilaiUjian::class);
    }
}
