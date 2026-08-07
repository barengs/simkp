<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationCriteria extends Model
{
    use HasFactory;

    protected $fillable = ['kode', 'nama', 'deskripsi', 'bobot'];
}
