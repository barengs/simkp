<?php

namespace App\Policies;

use App\Models\User;
use App\Models\KpGrade;
use Illuminate\Auth\Access\Response;

class KpGradePolicy
{
    public function view(User $user, KpGrade $kpGrade)
    {
        if ($user->hasAnyRole(['admin', 'koordinator', 'dosen'])) {
            return true;
        }

        return $kpGrade->kpGroupMember->student_id === $user->student?->id;
    }

    public function create(User $user)
    {
        return $user->hasRole('dosen') && $user->can('kp.nilai');
    }

    public function update(User $user, KpGrade $kpGrade)
    {
        if ($user->hasAnyRole(['admin', 'koordinator'])) {
            return true;
        }

        if ($user->hasRole('dosen')) {
            return $kpGrade->kpGroupMember->kpGroup->members()
                ->whereNotNull('supervisor_lecturer_id')
                ->where('supervisor_lecturer_id', optional($user->lecturer)->id)
                ->exists();
        }

        return false;
    }

    public function delete(User $user)
    {
        return $user->hasAnyRole(['admin', 'koordinator']);
    }
}
