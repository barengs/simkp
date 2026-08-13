<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Report;
use Illuminate\Auth\Access\Response;

class ReportPolicy
{
    public function view(User $user, Report $report)
    {
        if ($user->hasAnyRole(['admin', 'koordinator', 'dosen'])) {
            return true;
        }

        return $report->student_id === $user->student?->id;
    }

    public function create(User $user)
    {
        return $user->hasRole('mahasiswa') && $user->can('kp.laporan.input');
    }

    public function update(User $user, Report $report)
    {
        if ($user->hasAnyRole(['admin', 'koordinator'])) {
            return true;
        }

        if ($user->hasRole('dosen')) {
            return $report->kpGroup->members()
                ->whereNotNull('supervisor_lecturer_id')
                ->where('supervisor_lecturer_id', optional($user->lecturer)->id)
                ->exists();
        }

        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student) {
                return false;
            }

            return $report->kpGroup->members()
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->exists()
                && in_array($report->status, ['pending', 'rejected']);
        }

        return false;
    }

    public function delete(User $user, Report $report)
    {
        if ($user->hasAnyRole(['admin', 'koordinator'])) {
            return true;
        }

        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student) {
                return false;
            }

            return $report->kpGroup->members()
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->exists();
        }

        return false;
    }
}
