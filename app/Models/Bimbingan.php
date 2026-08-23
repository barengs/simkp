<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Bimbingan extends Model
{
    protected $table = 'bimbingan';

    protected $fillable = [
        'bimbingable_id',
        'bimbingable_type',
        'mahasiswa_id',
        'dosen_id',
        'tanggal',
        'aktivitas',
        'file',
        'catatan_dosen',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function bimbingable(): MorphTo
    {
        return $this->morphTo();
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'mahasiswa_id');
    }

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class, 'dosen_id');
    }
}
