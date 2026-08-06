<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemaKp extends Model
{
    use HasFactory;

    protected $fillable = ['nama_tema', 'deskripsi', 'is_active'];
}
