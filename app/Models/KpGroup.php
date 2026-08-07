<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_kelompok',
        'nama_kelompok',
        'program_studi_id',
        'periode_akademik_id',
        'tema_kp_id',
        'perusahaan_kp_id',
        'dosen_pembimbing_id',
        'dosen_penguji_id',
        'jumlah_anggota',
        'status',
    ];

    protected $casts = [
        'jumlah_anggota' => 'integer',
        'status' => 'string',
    ];

    public function programStudi()
    {
        return $this->belongsTo(ProgramStudi::class);
    }

    public function periodeAkademik()
    {
        return $this->belongsTo(PeriodeAkademik::class);
    }

    public function temaKp()
    {
        return $this->belongsTo(TemaKp::class);
    }

    public function perusahaanKp()
    {
        return $this->belongsTo(PerusahaanKp::class);
    }

    public function dosenPembimbing()
    {
        return $this->belongsTo(Dosen::class, 'dosen_pembimbing_id');
    }

    public function dosenPenguji()
    {
        return $this->belongsTo(Dosen::class, 'dosen_penguji_id');
    }

    public function anggota()
    {
        return $this->hasMany(AnggotaKelompokKp::class);
    }

    public function logbook()
    {
        return $this->hasMany(Logbook::class);
    }

    public function dokumenKp()
    {
        return $this->hasMany(DokumenKp::class);
    }

    public function tugasAkhir()
    {
        return $this->hasOne(TugasAkhir::class);
    }

    public function bimbingan()
    {
        return $this->morphMany(Bimbingan::class, 'bimbable');
    }

    public function laporan()
    {
        return $this->morphMany(Laporan::class, 'laporable');
    }

    public function jadwalUjian()
    {
        return $this->hasOne(JadwalUjian::class);
    }

    public function nilaiKp()
    {
        return $this->hasOne(NilaiKp::class);
    }

    public function nilaiUjian()
    {
        return $this->hasOne(NilaiUjian::class);
    }

    public function repository()
    {
        return $this->hasMany(Repository::class);
    }

    public function statusHistories()
    {
        return $this->morphMany(StatusHistory::class, 'statusable');
    }
}
