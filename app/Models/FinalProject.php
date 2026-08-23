<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class FinalProject extends Model
{
    use HasFactory;

    protected $table = 'final_project';

    protected $fillable = [
        'title',
        'description',
        'mahasiswa_id',
        'periode_id',
        'judul_disetujui',
        'catatan_penolakan',
        'tanggal_pengajuan',
        'status',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'mahasiswa_id');
    }

    public function periode(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function dosenPembimbing(): MorphMany
    {
        return $this->morphMany(DosenPembimbing::class, 'pembimbingable');
    }

    public function bimbingan(): MorphMany
    {
        return $this->morphMany(Bimbingan::class, 'bimbingable');
    }
}
