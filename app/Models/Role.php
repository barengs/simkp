<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

/**
 * Model Role kustom — extend Spatie Role untuk menambah kolom `description`.
 *
 * Kolom `description` ditambahkan via migration
 * add_description_to_roles_table dan bersifat nullable.
 */
class Role extends SpatieRole
{
    /**
     * Tambahkan 'description' ke fillable Spatie yang sudah ada.
     */
    protected $fillable = [
        'name',
        'guard_name',
        'description',
    ];
}
