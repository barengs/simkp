<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationSetting extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_aplikasi';
    protected $fillable = ['key', 'value', 'tipe'];
}
