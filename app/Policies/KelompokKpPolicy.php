<?php

namespace App\Policies;

use App\Models\User;
use App\Models\KelompokKp;
use Illuminate\Auth\Access\Response;

class KelompokKpPolicy
{
    public function view(User $user, KelompokKp $kelompok)
    {
        // Admin/Koordinator/Dosen bisa lihat semua
        if ($user->hasAnyRole(['admin', 'koordinator', 'dosen'])) {
            return true;
        }

        // Mahasiswa hanya lihat kelompok mereka sendiri
        return $kelompok->anggota()
            ->whereHas('mahasiswa.user', fn($q) => $q->where('id', $user->id))
            ->exists();
    }

    public function create(User $user)
    {
        return $user->can('kp.kelompok.create');
    }

    public function update(User $user, KelompokKp $kelompok)
    {
        if ($user->hasAnyRole(['admin', 'koordinator'])) {
            return true;
        }

        // Dosen pembimbing bisa update kelompok yang dibimbing
        if ($user->hasRole('dosen')) {
            return $kelompok->dosen_pembimbing_id === optional($user->dosen)->id;
        }

        return false;
    }

    public function delete(User $user, KelompokKp $kelompok)
    {
        return $user->hasRole('admin');
    }
}
