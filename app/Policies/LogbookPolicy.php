<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Logbook;
use Illuminate\Auth\Access\Response;

class LogbookPolicy
{
    public function view(User $user, Logbook $logbook)
    {
        // Admin/Koordinator/Dosen bisa lihat semua
        if ($user->hasAnyRole(['admin', 'koordinator', 'dosen'])) {
            return true;
        }

        // Mahasiswa hanya lihat logbook kelompok mereka
        return $logbook->kelompokKp->anggota()
            ->whereHas('mahasiswa.user', fn($q) => $q->where('id', $user->id))
            ->exists();
    }

    public function create(User $user)
    {
        return $user->can('kp.logbook.input');
    }

    public function update(User $user, Logbook $logbook)
    {
        // Dosen pembimbing bisa approve logbook
        if ($user->hasRole('dosen')) {
            return $logbook->kelompokKp->dosen_pembimbing_id === optional($user->dosen)->id;
        }

        return $user->hasAnyRole(['admin', 'koordinator']);
    }

    public function delete(User $user, Logbook $logbook)
    {
        return $user->hasRole('admin');
    }
}
