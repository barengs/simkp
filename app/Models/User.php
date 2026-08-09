<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'profile_picture_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** Relasi ke data mahasiswa (jika user ini adalah mahasiswa) */
    public function student()
    {
        return $this->hasOne(Student::class, 'user_id');
    }

    /** Relasi ke data dosen (jika user ini adalah dosen) */
    public function lecturer()
    {
        return $this->hasOne(Lecturer::class, 'user_id');
    }
}
