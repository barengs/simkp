<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KpCompany extends Model
{
    use HasFactory;

    protected $table = 'kp_company';

    protected $fillable = ['name', 'address', 'contact_person', 'phone_number', 'email', 'description'];



}
