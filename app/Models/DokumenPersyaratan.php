<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenPersyaratan extends Model
{
    protected $table = 'dokumen_persyaratan';

    protected $fillable = [
        'tugas_akhir_id',
        'nama_dokumen',
        'file_path',
        'status_validasi',
        'catatan',
    ];

    /**
     * Get the Tugas Akhir record.
     */
    public function tugasAkhir(): BelongsTo
    {
        return $this->belongsTo(TugasAkhir::class);
    }
}
