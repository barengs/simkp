<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Report;
use Illuminate\Auth\Access\Response;

class ReportPolicy
{
    /**
     * Determine whether the user can view any reports.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view kp reports')
            || $user->hasPermissionTo('validate report');
    }

    /**
     * Determine whether the user can view a specific report.
     */
    public function view(User $user, Report $report): bool
    {
        if ($user->hasPermissionTo('manage internships')) {
            return true;
        }

        if ($user->hasPermissionTo('validate report')
            && $report->internship->supervisor_id === $user->lecturer?->id) {
            return true;
        }

        if ($user->hasPermissionTo('student report')
            && $report->internship->leader_id === $user->student?->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create a report.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('student report');
    }

    /**
     * Determine whether the user can update a report.
     */
    public function update(User $user, Report $report): bool
    {
        return $user->hasPermissionTo('student report')
            && $report->internship->leader_id === $user->student?->id;
    }

    /**
     * Determine whether the user can delete a report.
     */
    public function delete(User $user, Report $report): bool
    {
        return $user->hasPermissionTo('student report')
            && $report->internship->leader_id === $user->student?->id;
    }

    /**
     * Determine whether the user can approve a report.
     */
    public function approve(User $user, Report $report): bool
    {
        return $user->hasPermissionTo('validate report')
            && $report->internship->supervisor_id === $user->lecturer?->id;
    }

    /**
     * Determine whether the user can reject a report.
     */
    public function reject(User $user, Report $report): bool
    {
        return $user->hasPermissionTo('validate report')
            && $report->internship->supervisor_id === $user->lecturer?->id;
    }
}
