<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Evaluation;
use Illuminate\Auth\Access\Response;

class EvaluationPolicy
{
    /**
     * Determine whether the user can view any evaluations.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view evaluation recap')
            || $user->hasPermissionTo('score internships');
    }

    /**
     * Determine whether the user can view a specific evaluation.
     */
    public function view(User $user, Evaluation $evaluation): bool
    {
        if ($user->hasPermissionTo('manage internships')) {
            return true;
        }

        if ($user->hasPermissionTo('score internships')
            && $evaluation->internship->supervisor_id === $user->lecturer?->id) {
            return true;
        }

        if ($user->hasPermissionTo('student evaluation')
            && $evaluation->internship->leader_id === $user->student?->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create or update an evaluation.
     */
    public function createOrUpdate(User $user, Evaluation $evaluation): bool
    {
        return $user->hasPermissionTo('score internships')
            && $evaluation->internship->supervisor_id === $user->lecturer?->id;
    }

    /**
     * Determine whether the user can delete an evaluation.
     */
    public function delete(User $user, Evaluation $evaluation): bool
    {
        return $user->hasPermissionTo('manage internships');
    }
}
