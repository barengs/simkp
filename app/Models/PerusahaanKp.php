<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerusahaanKp extends Model
{
    use HasFactory;

    protected $fillable = ['nama_perusahaan', 'alamat', 'no_telp', 'email', 'nama_pic'];
}
