<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Internship;
use Illuminate\Auth\Access\Response;

class InternshipPolicy
{
    /**
     * Determine whether the user can view any internships.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view internships');
    }

    /**
     * Determine whether the user can view a specific internship.
     */
    public function view(User $user, Internship $internship): bool
    {
        if ($user->hasPermissionTo('manage internships')) {
            return true;
        }

        if ($user->hasPermissionTo('validate logbook')
            && $internship->supervisor_id === $user->lecturer?->id) {
            return true;
        }

        if ($user->hasPermissionTo('student logbook')
            && $internship->leader_id === $user->student?->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create an internship.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage internships');
    }

    /**
     * Determine whether the user can update an internship.
     */
    public function update(User $user, Internship $internship): bool
    {
        return $user->hasPermissionTo('manage internships');
    }

    /**
     * Determine whether the user can delete an internship.
     */
    public function delete(User $user, Internship $internship): bool
    {
        return $user->hasPermissionTo('manage internships');
    }

    /**
     * Determine whether the user can assign a supervisor.
     */
    public function assignSupervisor(User $user): bool
    {
        return $user->hasPermissionTo('manage internships');
    }
}
