<?php

namespace App\Services;

use App\Models\User;
use App\Models\Student;
use App\Models\Lecturer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new mahasiswa user.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'mahasiswa',
        ]);

        $token = auth('api')->login($user);

        Log::info('User registered', ['user_id' => $user->id, 'email' => $user->email]);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Login user and create token.
     */
    public function login(array $credentials): array
    {
        $token = auth('api')->attempt($credentials);

        if (!$token) {
            throw ValidationException::withMessages([
                'email' => ['Email atau Password salah'],
            ]);
        }

        $user = auth('api')->user();

        Log::info('User logged in', ['user_id' => $user->id]);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout user (delete current token).
     */
    public function logout(User $user): void
    {
        auth('api')->logout();
        Log::info('User logged out', ['user_id' => $user->id]);
    }

    /**
     * Get current authenticated user with profile data.
     */
    public function getAuthenticatedUser(User $user): array
    {
        $userData = $user->toArray();
        $userData['is_profile_complete'] = $this->checkProfileComplete($user);
        $userData['roles'] = $user->getRoleNames()->toArray();
        $userData['permissions'] = $user->getAllPermissions()->pluck('name')->toArray();
        
        // Debug: Log the loaded permissions to verify they are not empty
        Log::info('AuthService: Loaded permissions for user ' . $user->id . ': ' . json_encode($userData['permissions']));
        $userData['avatar_url'] = $user->avatar ? asset('storage/' . $user->avatar) : null;
        $userData['phone'] = $user->phone ?? ($user->student?->phone ?? $user->lecturer?->phone);

        if ($user->role === 'mahasiswa' || $user->isStudent()) {
            $userData['redirect_url'] = $userData['is_profile_complete'] ? '/' : '/student/profile';
            $userData['student'] = Student::where('user_id', $user->id)->first();
            Log::info('AuthService: Loaded student profile for user ' . $user->id . ': ' . json_encode($userData['student']));
        } elseif ($user->isAdmin()) {
            $userData['redirect_url'] = '/';
        } elseif ($user->isLecturerRole()) {
            $userData['redirect_url'] = '/';
            $userData['lecturer'] = Lecturer::where('user_id', $user->id)->first();
            Log::info('AuthService: Loaded lecturer profile for user ' . $user->id . ': ' . json_encode($userData['lecturer']));
        }

        return $userData;
    }

    /**
     * Complete mahasiswa profile.
     */
    public function completeProfile(User $user, array $data): User
    {
        $activePeriod = \App\Models\Period::where('is_active', true)->first();

        Student::updateOrCreate(
            ['user_id' => $user->id],
            [
                'period_id' => $activePeriod?->id,
                'nim' => $data['nim'],
                'major' => $data['major'],
                'batch_year' => $data['batch_year'],
                'phone' => $data['phone'] ?? null,
            ]
        );

        Log::info('Profile completed', ['user_id' => $user->id]);

        return $user->fresh();
    }

    /**
     * Check if mahasiswa profile is complete.
     */
    private function checkProfileComplete(User $user): bool
    {
        if ($user->role !== 'mahasiswa') {
            return true;
        }
        return Student::where('user_id', $user->id)->exists();
    }
}
