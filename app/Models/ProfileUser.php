<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileUser extends Model
{
    protected $table = 'profile_users';

    protected $fillable = [
        'user_id',
        'role',
        'nim',
        'major',
        'batch_year',
        'nip',
        'jabatan_fungsional',
        'kuota_bimbingan',
        'phone',
        'period_id',
    ];

    /**
     * Get the user account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the period.
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }
}
