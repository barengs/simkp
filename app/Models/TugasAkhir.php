<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TugasAkhir extends Model
{
    protected $table = 'tugas_akhir';

    protected $fillable = [
        'user_id',
        'internship_id',
        'judul_diajukan',
        'judul_disetujui',
        'latar_belakang_singkat',
        'pembimbing_1_id',
        'pembimbing_2_id',
        'status',
        'rejection_note',
    ];

    /**
     * Get the student (mahasiswa) who owns this TA.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related internship (KP) record.
     */
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    /**
     * Get Pembimbing 1.
     */
    public function pembimbing1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pembimbing_1_id');
    }

    /**
     * Get Pembimbing 2.
     */
    public function pembimbing2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pembimbing_2_id');
    }
}
