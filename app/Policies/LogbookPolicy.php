<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Logbook;
use Illuminate\Auth\Access\Response;

class LogbookPolicy
{
    public function view(User $user, Logbook $logbook)
    {
        if ($user->hasAnyRole(['admin', 'koordinator', 'dosen'])) {
            return true;
        }

        return $logbook->kpGroup->members()
            ->whereHas('student.user', fn($q) => $q->where('id', $user->id))
            ->exists();
    }

    public function create(User $user)
    {
        return $user->can('kp.logbook');
    }

    public function update(User $user, Logbook $logbook)
    {
        if ($user->hasAnyRole(['admin', 'koordinator'])) {
            return true;
        }

        if ($user->hasRole('dosen')) {
            return $logbook->kpGroup->members()
                ->whereNotNull('supervisor_lecturer_id')
                ->where('supervisor_lecturer_id', optional($user->lecturer)->id)
                ->exists();
        }

        if ($user->hasRole('mahasiswa')) {
            return $logbook->student_id === $user->student?->id
                && $logbook->status === 'pending';
        }

        return false;
    }

    public function delete(User $user, Logbook $logbook)
    {
        if ($user->hasAnyRole(['admin', 'koordinator'])) {
            return true;
        }

        if ($user->hasRole('mahasiswa')) {
            return $logbook->student_id === $user->student?->id
                && $logbook->status === 'pending';
        }

        return false;
    }
}
