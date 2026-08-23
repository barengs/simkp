<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DosenPembimbing extends Model
{
    protected $table = 'dosen_pembimbing';

    protected $fillable = [
        'pembimbingable_id',
        'pembimbingable_type',
        'dosen_id',
        'peran',
        'status_acc_ujian',
        'status_acc_revisi',
    ];

    protected $casts = [
        'status_acc_ujian' => 'boolean',
        'status_acc_revisi' => 'boolean',
    ];

    public function pembimbingable(): MorphTo
    {
        return $this->morphTo();
    }

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class);
    }
}
