<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bimbingan extends Model
{
    protected $table = 'bimbingan';

    protected $fillable = [
        'tugas_akhir_id',
        'dosen_id',
        'tanggal_bimbingan',
        'topik_bahasan',
        'catatan_mahasiswa',
        'file_draft',
        'catatan_dosen',
        'status',
    ];

    /**
     * Get the Tugas Akhir details.
     */
    public function tugasAkhir(): BelongsTo
    {
        return $this->belongsTo(TugasAkhir::class);
    }

    /**
     * Get the lecturer.
     */
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dosen_id');
    }
}
