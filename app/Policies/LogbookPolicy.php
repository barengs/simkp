<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Logbook;
use Illuminate\Auth\Access\Response;

class LogbookPolicy
{
    /**
     * Determine whether the user can view any logbooks.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view logbook monitoring')
            || $user->hasPermissionTo('validate logbook');
    }

    /**
     * Determine whether the user can view a specific logbook.
     */
    public function view(User $user, Logbook $logbook): bool
    {
        if ($user->hasPermissionTo('manage internships')) {
            return true;
        }

        if ($user->hasPermissionTo('validate logbook')
            && $logbook->internship->supervisor_id === $user->lecturer?->id) {
            return true;
        }

        if ($user->hasPermissionTo('student logbook')
            && $logbook->internship->leader_id === $user->student?->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create a logbook.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('student logbook');
    }

    /**
     * Determine whether the user can update a logbook.
     */
    public function update(User $user, Logbook $logbook): bool
    {
        return $user->hasPermissionTo('student logbook')
            && $logbook->internship->leader_id === $user->student?->id;
    }

    /**
     * Determine whether the user can delete a logbook.
     */
    public function delete(User $user, Logbook $logbook): bool
    {
        return $user->hasPermissionTo('student logbook')
            && $logbook->internship->leader_id === $user->student?->id;
    }

    /**
     * Determine whether the user can approve a logbook.
     */
    public function approve(User $user, Logbook $logbook): bool
    {
        return $user->hasPermissionTo('validate logbook')
            && $logbook->internship->supervisor_id === $user->lecturer?->id;
    }

    /**
     * Determine whether the user can reject a logbook.
     */
    public function reject(User $user, Logbook $logbook): bool
    {
        return $user->hasPermissionTo('validate logbook')
            && $logbook->internship->supervisor_id === $user->lecturer?->id;
    }
}
