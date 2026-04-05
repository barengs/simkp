<?php

namespace App\Services;

use App\Models\Activity;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ActivityService
{
    /**
     * Log a new activity for the current or specified user.
     */
    public function log($type, $description, $userId = null, $properties = [])
    {
        try {
            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            
            return Activity::create([
                'user_id' => $userId ?? Auth::id(),
                'period_id' => $activePeriod ? $activePeriod->id : null,
                'type' => $type,
                'description' => $description,
                'properties' => $properties,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log activity: " . $e->getMessage(), [
                'type' => $type,
                'user_id' => $userId ?? Auth::id(),
            ]);
            return null;
        }
    }

    /**
     * Get paginated activities based on role and active period.
     */
    public function getAll($user, $limit = 15)
    {
        try {
            $query = Activity::with(['user', 'period'])
                ->latest();

            // Filter by active period if exists (Skip for students to show full history)
            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            if ($activePeriod && $user->role !== 'mahasiswa') {
                $query->where('period_id', $activePeriod->id);
            }

            // Role-based filtering
            if ($user->role === 'mahasiswa') {
                $query->where('user_id', $user->id);
            } elseif ($user->role === 'dosen') {
                // Activities for their supervised students
                $query->whereHas('user.student.internships', function($q) use ($user) {
                    $q->where('supervisor_id', $user->lecturer->id);
                });
            }

            return $query->paginate($limit);
        } catch (\Exception $e) {
            Log::error("Failed to fetch activities: " . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get the latest N activities for dashboard.
     */
    public function getLatest($user, $limit = 5)
    {
        try {
            $query = Activity::with('user')
                ->latest();

            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            if ($activePeriod && $user->role !== 'mahasiswa') {
                $query->where('period_id', $activePeriod->id);
            }

            if ($user->role === 'mahasiswa') {
                $query->where('user_id', $user->id);
            } elseif ($user->role === 'dosen') {
                 $query->whereHas('user.student.internships', function($q) use ($user) {
                    $q->where('supervisor_id', $user->lecturer->id);
                });
            }

            return $query->limit($limit)->get();
        } catch (\Exception $e) {
            Log::error("Failed to fetch latest activities: " . $e->getMessage());
            return collect([]);
        }
    }
}
