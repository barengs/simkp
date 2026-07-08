<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Repository extends Model
{
    protected $table = 'repository';

    protected $fillable = [
        'tugas_akhir_id',
        'abstrak_id',
        'abstrak_en',
        'kata_kunci',
        'file_pdf_full',
        'file_jurnal',
        'file_source_code',
        'is_public',
    ];

    /**
     * Get the Tugas Akhir details.
     */
    public function tugasAkhir(): BelongsTo
    {
        return $this->belongsTo(TugasAkhir::class);
    }
}
